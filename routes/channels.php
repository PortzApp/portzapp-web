<?php

use Illuminate\Support\Facades\Broadcast;

// Static channels for real-time updates
// Client-side filtering handles data segregation based on organization

Broadcast::channel('orders.updated', function () {
    return true; // All authenticated users can listen, filtering handled client-side
});

Broadcast::channel('order-groups.updated', function () {
    return true; // All authenticated users can listen, filtering handled client-side
});

Broadcast::channel('order-group-services.updated', function () {
    return true; // All authenticated users can listen, filtering handled client-side
});
