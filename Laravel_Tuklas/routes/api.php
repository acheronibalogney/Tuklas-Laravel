<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\DatabaseHealthController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\ExampleController;
use App\Http\Controllers\FolderController;
use App\Http\Controllers\ScanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\LoginLogController;
use Illuminate\Support\Facades\Route;

Route::get('/db-health', DatabaseHealthController::class);
Route::match(['get', 'post', 'delete'], '/auth', [AuthController::class, 'handle']);
Route::match(['get', 'put', 'delete'], '/users', [UserController::class, 'handle']);
Route::get('/login-logs', [LoginLogController::class, 'index']);
Route::match(['get', 'put'], '/scans', [ScanController::class, 'handle']);
Route::match(['get', 'put'], '/documents', [DocumentController::class, 'handle']);
Route::get('/folders', [FolderController::class, 'index']);
Route::match(['get', 'post'], '/examples', [ExampleController::class, 'handle']);
Route::post('/scan', [ScanController::class, 'analyze']);
