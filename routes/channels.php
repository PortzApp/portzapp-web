<?php

use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('services', function (User $user) {
    return true;
});

Broadcast::channel('orders', function (User $user) {
    return true;
});

Broadcast::channel('order-groups', function (User $user) {
    return true;
});

Broadcast::channel('order-group-services', function (User $user) {
    return true;
});
