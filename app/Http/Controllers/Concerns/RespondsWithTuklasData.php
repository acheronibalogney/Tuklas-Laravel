<?php

namespace App\Http\Controllers\Concerns;

use App\Models\User;
use Illuminate\Http\JsonResponse;

trait RespondsWithTuklasData
{
    protected function publicUser(User $user): array
    {
        $profile = $user->profile ?: [];
        $nameParts = preg_split('/\s+/', trim((string) $user->name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $fallbackFirstName = $nameParts[0] ?? '';
        $fallbackLastName = implode(' ', array_slice($nameParts, 1));

        // The database name is the canonical name for OAuth-created accounts.
        // Fill empty profile fields from it so older social accounts render the
        // same way as newly completed profiles.
        $profile['displayName'] = trim((string) ($profile['displayName'] ?? '')) ?: $user->name;
        $profile['firstName'] = trim((string) ($profile['firstName'] ?? '')) ?: $fallbackFirstName;
        $profile['lastName'] = trim((string) ($profile['lastName'] ?? '')) ?: $fallbackLastName;

        return array_merge($user->only(['name', 'role', 'status', 'created_at', 'updated_at']), [
            'email' => $user->email, 'firstName' => $profile['firstName'], 'lastName' => $profile['lastName'],
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
