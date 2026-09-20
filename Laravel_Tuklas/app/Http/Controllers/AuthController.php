<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\RespondsWithTuklasData;
use App\Models\User;
use App\Models\LoginLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    use RespondsWithTuklasData;

    public function handle(Request $request)
    {
        if ($request->isMethod('get')) return Auth::check() ? response()->json($this->publicUser($request->user())) : $this->unauthorized();
        if ($request->isMethod('delete')) { Auth::logout(); $request->session()->invalidate(); $request->session()->regenerateToken(); return response()->json(['ok' => true])->withoutCookie('tuklas_trusted_device'); }

        $request->validate(['action' => ['required', Rule::in(['login', 'verify-otp', 'signup', 'social', 'update-password', 'forgot-password'])]]);
        $action = $request->string('action')->toString();

        if ($action === 'login') {
            $request->validate(['email' => 'required|email', 'password' => 'required|string']);
            $email = strtolower($request->string('email')->toString());
            $user = User::where('email', $email)->where('status', 'active')->first();
            if (!$user || !Hash::check($request->string('password')->toString(), $user->password)) return response()->json(['error' => 'Invalid email or password.'], 401);
            if (!$this->otpRequired($email) || $this->trustedDeviceIsValid($request, $email)) return $this->loginResponse($request, $user, true);
            $challenge = $this->createOtpChallenge($user);
            try { $this->sendOtp($email, $challenge['code']); } catch (\Throwable $error) { \Illuminate\Support\Facades\DB::table('otp_challenges')->where('token_hash', hash('sha256', $challenge['token']))->delete(); return response()->json(['error' => $error->getMessage() ?: 'Unable to send the verification code.'], 503); }
            return response()->json(['requiresOtp' => true, 'challengeToken' => $challenge['token'], 'maskedEmail' => $this->maskEmail($email)]);
        }

        if ($action === 'verify-otp') {
            $request->validate(['challengeToken' => 'required|string', 'code' => 'required|digits:6', 'trustDevice' => 'nullable|boolean']);
            $challenge = \Illuminate\Support\Facades\DB::table('otp_challenges')->where('token_hash', hash('sha256', $request->string('challengeToken')->toString()))->first();
            if (!$challenge || now()->greaterThan($challenge->expires_at)) return response()->json(['error' => 'That verification code is invalid or expired.'], 401);
            if ($challenge->attempts >= 5) return response()->json(['error' => 'Too many attempts. Please sign in again.'], 429);
            if (!Hash::check($request->string('code')->toString(), $challenge->code_hash)) { \Illuminate\Support\Facades\DB::table('otp_challenges')->where('id', $challenge->id)->increment('attempts'); return response()->json(['error' => 'That verification code is incorrect.'], 401); }
            $user = User::find($challenge->user_id); \Illuminate\Support\Facades\DB::table('otp_challenges')->where('id', $challenge->id)->delete();
            return $this->loginResponse($request, $user, $request->boolean('trustDevice', true));
        }

        if ($action === 'signup') {
            $request->validate(['name' => 'required|string|max:255', 'email' => 'required|email|unique:users,email', 'password' => 'required|string|min:8']);
            $profile = $request->only(['firstName','lastName','municipality','barangay','streetAddress','birthDate','dob','currentStatus','employment','highestEducation','location','picture','mobile','gender']);
            $user = User::create(['name' => $request->string('name')->toString(), 'email' => strtolower($request->string('email')->toString()), 'password' => $request->string('password')->toString(), 'profile' => $profile, 'notifications' => [], 'settings' => []]);
            return $this->loginResponse($request, $user, true, 201);
        }

        if ($action === 'social') {
            $request->validate(['email' => 'required|email', 'name' => 'nullable|string|max:255', 'provider' => 'nullable|string|max:30']);
            $provider = strtolower($request->string('provider', 'social')->toString());
            $email = strtolower($request->string('email')->toString());
            $user = User::where('email', $email)->first();
            if (!$user) {
                $user = User::create(['name' => $request->string('name', $request->string('email'))->toString(), 'email' => $email, 'password' => Str::random(40), 'profile' => ['picture' => $request->string('picture')->toString(), 'authProvider' => $provider, 'needsPasswordSetup' => true], 'notifications' => [], 'settings' => []]);
            }
            $profile = $user->profile ?: [];
            // Older social accounts may not have the setup flag yet. Only
            // mark accounts that are already identified as social accounts;
            // do not interrupt normal password accounts sharing the email.
            if ($request->filled('provider') && array_key_exists('authProvider', $profile) && !array_key_exists('needsPasswordSetup', $profile)) {
                $profile['needsPasswordSetup'] = true;
                $user->forceFill(['profile' => $profile])->save();
            }
            return $this->loginResponse($request, $user, true, 200, $provider);
        }

        if ($action === 'update-password') {
            abort_unless(Auth::check(), 401);
            $user = $request->user();
            $profile = $user->profile ?: [];
            $socialSetup = !empty($profile['needsPasswordSetup']);
            $request->validate(['newPassword' => 'required|string|min:8|confirmed', 'currentPassword' => $socialSetup ? 'nullable|string' : 'required|string']);
            if (!$socialSetup && !Hash::check($request->string('currentPassword')->toString(), $user->password)) return response()->json(['error' => 'Your current password is incorrect.'], 422);
            $user->password = $request->string('newPassword')->toString();
            $profile['needsPasswordSetup'] = false;
            $user->profile = $profile;
            $user->save();
            return response()->json($this->publicUser($user));
        }

        return response()->json(['ok' => true]);
    }

    private function otpRequired(string $email): bool { return config('auth.otp.enabled') && !in_array($email, config('auth.test_accounts', []), true); }

    private function loginResponse(Request $request, User $user, bool $trustDevice, int $status = 200, string $provider = 'password')
    {
        Auth::login($user); $request->session()->regenerate();
        LoginLog::create(['user_id' => $user->id, 'provider' => $provider, 'ip_address' => $request->ip(), 'user_agent' => $request->userAgent(), 'logged_in_at' => now()]);
        $response = response()->json($this->publicUser($user), $status);
        if ($trustDevice) $response->withCookie(Cookie::make('tuklas_trusted_device', $this->trustedToken($user->email), 60 * 24 * config('auth.otp.trusted_device_days', 30), '/', null, $request->isSecure(), true, false, 'lax'));
        return $response;
    }

    private function trustedDeviceIsValid(Request $request, string $email): bool { return hash_equals($this->trustedToken($email), (string) $request->cookie('tuklas_trusted_device', '')); }
    private function trustedToken(string $email): string { return hash_hmac('sha256', strtolower($email), (string) config('app.key')); }

    private function createOtpChallenge(User $user): array
    {
        $token = Str::random(64); $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        \Illuminate\Support\Facades\DB::table('otp_challenges')->where('user_id', $user->id)->delete();
        \Illuminate\Support\Facades\DB::table('otp_challenges')->insert(['user_id' => $user->id, 'token_hash' => hash('sha256', $token), 'code_hash' => Hash::make($code), 'expires_at' => now()->addMinutes(config('auth.otp.expires', 5)), 'created_at' => now(), 'updated_at' => now()]);
        return compact('token', 'code');
    }

    private function sendOtp(string $email, string $code): void
    {
        $key = trim((string) config('services.resend.key')); $from = trim((string) config('services.resend.from'));
        if (!$key || !$from) throw new \RuntimeException('OTP is enabled, but RESEND_API_KEY or AUTH_EMAIL_FROM is missing.');
        $response = Http::withToken($key)->post('https://api.resend.com/emails', ['from' => $from, 'to' => [$email], 'subject' => 'Your Tuklas verification code', 'html' => '<p>Your Tuklas verification code is <strong style="font-size:28px;letter-spacing:6px">'.$code.'</strong>.</p><p>This code expires in 5 minutes.</p>']);
        if ($response->failed()) throw new \RuntimeException('Unable to send the verification email.');
    }

    private function maskEmail(string $email): string { [$name, $domain] = array_pad(explode('@', $email, 2), 2, ''); return substr($name, 0, 2).str_repeat('*', max(1, strlen($name) - 2)).'@'.$domain; }
}
