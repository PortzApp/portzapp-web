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

Broadcast::channel('order-group-chat.{orderGroupId}', function ($user, $orderGroupId) {
    $orderGroup = \App\Models\OrderGroup::with('order')->find($orderGroupId);

    if (! $orderGroup) {
        return false;
    }

    // Allow vessel owner (who placed the order) and agency (fulfilling the order group)
    return $user->id === $orderGroup->order->placed_by_user_id ||
           $user->current_organization_id === $orderGroup->fulfilling_organization_id;
});
