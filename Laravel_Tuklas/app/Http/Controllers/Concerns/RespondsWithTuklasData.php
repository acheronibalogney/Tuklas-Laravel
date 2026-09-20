<?php

namespace App\Http\Controllers\Concerns;

use App\Models\User;
use Illuminate\Http\JsonResponse;

trait RespondsWithTuklasData
{
    protected function publicUser(User $user): array
    {
        $profile = $user->profile ?: [];
        return array_merge($user->only(['name', 'role', 'status', 'created_at', 'updated_at']), [
            'email' => $user->email, 'firstName' => $profile['firstName'] ?? '', 'lastName' => $profile['lastName'] ?? '',
            'municipality' => $profile['municipality'] ?? '', 'barangay' => $profile['barangay'] ?? '',
            'streetAddress' => $profile['streetAddress'] ?? '', 'birthDate' => $profile['birthDate'] ?? '',
            'currentStatus' => $profile['currentStatus'] ?? '', 'highestEducation' => $profile['highestEducation'] ?? '',
            'location' => $profile['location'] ?? '', 'picture' => $profile['picture'] ?? '', 'profile' => $profile,
            'analysis' => $user->analysis, 'notifications' => $user->notifications ?: [], 'settings' => $user->settings ?: [],
            'jetstream' => [
                'twoFactorEnabled' => $user->hasEnabledTwoFactorAuthentication(),
                'twoFactorConfigured' => !is_null($user->two_factor_secret),
                'apiTokens' => $user->tokens()->count(),
            ],
            'needsPasswordSetup' => (bool) ($profile['needsPasswordSetup'] ?? false),
            'authProvider' => $profile['authProvider'] ?? 'password',
        ]);
    }
    protected function unauthorized(): JsonResponse { return response()->json(['error' => 'Authentication required.'], 401); }
}
