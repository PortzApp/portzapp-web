<?php

namespace App\Observers;

use App\Events\OrderUpdated;
use App\Models\Order;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        // OrderCreated event would be dispatched from controller if needed
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Only broadcast if the status field was changed
        if ($order->wasChanged('status')) {
            // Use auth()->user() or the user who triggered the change
            // For observer-triggered changes, we'll use a system user or get from context
            $user = auth()->user();
            if (! $user) {
                $user = $order->placedByUser;
            }

            if ($user) {
                OrderUpdated::dispatch($user, $order);
            }
        }
    }

    /**
     * Handle the Order "deleted" event.
     */
    public function deleted(Order $order): void
    {
        // OrderDeleted event would be dispatched from controller if needed
    }

    /**
     * Handle the Order "restored" event.
     */
    public function restored(Order $order): void
    {
        //
    }

    /**
     * Handle the Order "force deleted" event.
     */
    public function forceDeleted(Order $order): void
    {
        //
    }
}
