<?php

namespace App\Providers;

use App\Actions\Jetstream\DeleteUser;
use Illuminate\Support\ServiceProvider;
use Laravel\Jetstream\Jetstream;

class JetstreamServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Jetstream::deleteUsersUsing(DeleteUser::class);
        Jetstream::defaultApiTokenPermissions(['read']);
        Jetstream::permissions(['create', 'read', 'update', 'delete']);
    }
}
