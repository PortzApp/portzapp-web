<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Dusk Testing Routes
|--------------------------------------------------------------------------
|
| These routes are only loaded in the testing environment for Laravel Dusk.
| They provide utilities for testing like user authentication.
|
*/

Route::get('/dusk/login/{user}', function (User $user) {
    auth()->login($user);

    return redirect('/dashboard');
})->name('dusk.login');
