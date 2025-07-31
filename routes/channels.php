<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('services', function (User $user) {
    return true;
});
