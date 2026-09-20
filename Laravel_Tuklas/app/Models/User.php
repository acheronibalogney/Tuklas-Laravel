<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasProfilePhoto, Notifiable, TwoFactorAuthenticatable;
    protected $fillable = ['name', 'email', 'password', 'role', 'status', 'workspace_id', 'profile', 'analysis', 'notifications', 'settings', 'profile_photo_path'];
    protected $hidden = ['password', 'remember_token'];
    protected function casts(): array { return ['email_verified_at' => 'datetime', 'password' => 'hashed', 'profile' => 'array', 'analysis' => 'array', 'notifications' => 'array', 'settings' => 'array']; }
    public function scans() { return $this->hasMany(Scan::class); }
    public function folders() { return $this->hasMany(Folder::class); }
    public function documents() { return $this->hasMany(Document::class); }
    public function loginLogs() { return $this->hasMany(LoginLog::class); }
}
