<?php

return [
    'default' => env('DB_CONNECTION', 'pgsql'),
    'connections' => [
        'pgsql' => [
            'driver' => 'pgsql', 'url' => env('DATABASE_URL'), 'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '5432'), 'database' => env('DB_DATABASE', 'tuklas'),
            'username' => env('DB_USERNAME', 'postgres'), 'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8', 'prefix' => '', 'prefix_indexes' => true, 'search_path' => 'public', 'sslmode' => env('DB_SSLMODE', 'prefer'),
        ],
    ],
    'migrations' => ['table' => 'migrations', 'update_date_on_publish' => true],
    'redis' => ['client' => env('REDIS_CLIENT', 'phpredis'), 'default' => ['url' => env('REDIS_URL'), 'host' => env('REDIS_HOST', '127.0.0.1'), 'password' => env('REDIS_PASSWORD'), 'port' => env('REDIS_PORT', 6379), 'database' => env('REDIS_DB', 0)]],
];
