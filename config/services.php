<?php return [
    'google' => ['client_id' => env('VITE_GOOGLE_CLIENT_ID'), 'client_secret' => env('GOOGLE_CLIENT_SECRET'), 'redirect' => env('GOOGLE_REDIRECT_URI')],
    'facebook' => ['graph_api_version' => env('FACEBOOK_GRAPH_API_VERSION', 'v26.0')],
    'gemini' => ['key' => env('GOOGLE_AI_API_KEY'), 'models' => env('GEMINI_MODELS')],
];
