<?php

namespace App\Actions\Jetstream;

use App\Models\User;
use Laravel\Jetstream\Contracts\DeletesUsers;

class DeleteUser implements DeletesUsers
{
    public function delete(User $user): void
    {
        $user->deleteProfilePhoto();
        $user->tokens()->delete();
        $user->delete();
    }
}
