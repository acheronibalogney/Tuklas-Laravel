<?php

return [
    'defaults' => ['guard' => 'web', 'passwords' => 'users'],
    'guards' => ['web' => ['driver' => 'session', 'provider' => 'users']],
    'providers' => ['users' => ['driver' => 'eloquent', 'model' => App\Models\User::class]],
    'passwords' => ['users' => ['provider' => 'users', 'table' => 'password_reset_tokens', 'expire' => 60, 'throttle' => 60]],
    'password_timeout' => 10800,
    'test_accounts' => array_values(array_filter(array_map('trim', explode(',', env('AUTH_TEST_ACCOUNTS', 'juan@tuklas.ph,maria@tuklas.ph,test@test.com,admin@tuklas.ph'))))),
    'otp' => ['enabled' => (bool) env('AUTH_OTP_REQUIRED', false), 'expires' => 5, 'trusted_device_days' => 30],
];
