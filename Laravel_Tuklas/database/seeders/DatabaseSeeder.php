<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (app()->environment('production')) return;
        foreach ([
            ['name' => 'Juan Dela Cruz', 'email' => 'juan@tuklas.ph', 'password' => 'password123'],
            ['name' => 'Maria Santos', 'email' => 'maria@tuklas.ph', 'password' => 'password123'],
            ['name' => 'Test User', 'email' => 'test@test.com', 'password' => 'test1234'],
            ['name' => 'Admin User', 'email' => 'admin@tuklas.ph', 'password' => 'admin123', 'role' => 'admin'],
        ] as $account) User::updateOrCreate(['email' => $account['email']], $account + ['profile' => [], 'notifications' => [], 'settings' => []]);
    }
}
