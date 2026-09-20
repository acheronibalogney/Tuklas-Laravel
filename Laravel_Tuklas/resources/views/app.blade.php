<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Tuklas') }}</title>
    @php
        // Use compiled assets by default so a stale public/hot file cannot blank the app.
        if (env('VITE_DEV_SERVER', 'false') !== 'true') {
            app(\Illuminate\Foundation\Vite::class)->useHotFile(storage_path('framework/vite-hot-disabled'));
        }
    @endphp
    @if (env('VITE_DEV_SERVER', 'false') === 'true')
        @viteReactRefresh
    @endif
    @vite(['resources/css/app.css', 'resources/js/main.tsx'])
</head>
<body><div id="root"></div></body>
</html>
