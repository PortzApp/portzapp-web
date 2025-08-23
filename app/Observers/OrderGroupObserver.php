<?php

namespace App\Observers;

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Models\OrderGroup;

class OrderGroupObserver
{
    /**
     * Handle the OrderGroup "created" event.
     */
    public function created(OrderGroup $orderGroup): void
    {
        $this->updateParentOrderStatus($orderGroup);
    }

    /**
     * Handle the OrderGroup "updated" event.
     */
    public function updated(OrderGroup $orderGroup): void
    {
        // Only update parent Order if the status field was changed
        if ($orderGroup->wasChanged('status')) {
            $this->updateParentOrderStatus($orderGroup);
        }
    }

    /**
     * Handle the OrderGroup "deleted" event.
     */
    public function deleted(OrderGroup $orderGroup): void
    {
        $this->updateParentOrderStatus($orderGroup);
    }

    /**
     * Handle the OrderGroup "restored" event.
     */
    public function restored(OrderGroup $orderGroup): void
    {
        $this->updateParentOrderStatus($orderGroup);
    }

    /**
     * Handle the OrderGroup "force deleted" event.
     */
    public function forceDeleted(OrderGroup $orderGroup): void
    {
        $this->updateParentOrderStatus($orderGroup);
    }

    /**
     * Update the parent Order's status based on all OrderGroup statuses.
     */
    private function updateParentOrderStatus(OrderGroup $orderGroup): void
    {
        $order = $orderGroup->order;

        if (! $order) {
            return;
        }

        // Get all OrderGroup statuses for this Order (excluding the deleted one for delete events)
        $orderGroupStatuses = $order->orderGroups()
            ->when($orderGroup->exists, function ($query) {
                // For updates, include the current OrderGroup
                return $query;
            }, function ($query) use ($orderGroup) {
                // For deletes, exclude the deleted OrderGroup
                return $query->where('id', '!=', $orderGroup->id);
            })
            ->pluck('status')
            ->map(fn ($status) => $status instanceof OrderGroupStatus ? $status : OrderGroupStatus::from($status));

        if ($orderGroupStatuses->isEmpty()) {
            // If no OrderGroups remain, set Order to DRAFT
            $newOrderStatus = OrderStatus::DRAFT;
        } else {
            $newOrderStatus = $this->calculateOrderStatus($orderGroupStatuses);
        }

        // Only update if the status actually needs to change
        if ($order->status !== $newOrderStatus) {
            $order->update(['status' => $newOrderStatus]);
        }
    }

    /**
     * Calculate the aggregated Order status based on OrderGroup statuses.
     */
    private function calculateOrderStatus($orderGroupStatuses): OrderStatus
    {
        $statusCounts = $orderGroupStatuses->countBy(fn ($status) => $status->value);

        $allCompleted = $orderGroupStatuses->every(fn ($status) => $status === OrderGroupStatus::COMPLETED);
        $allAccepted = $orderGroupStatuses->every(fn ($status) => $status === OrderGroupStatus::ACCEPTED);
        $anyRejected = $orderGroupStatuses->contains(OrderGroupStatus::REJECTED);
        $anyAccepted = $orderGroupStatuses->contains(OrderGroupStatus::ACCEPTED);
        $anyCompleted = $orderGroupStatuses->contains(OrderGroupStatus::COMPLETED);

        // Business logic for Order status aggregation
        if ($allCompleted) {
            return OrderStatus::CONFIRMED;
        }

        if ($allAccepted) {
            return OrderStatus::CONFIRMED;
        }

        if ($anyRejected) {
            return OrderStatus::CANCELLED;
        }

        if ($anyAccepted || $anyCompleted) {
            return OrderStatus::PARTIALLY_CONFIRMED;
        }

        // Default: all OrderGroups are still pending
        return OrderStatus::PENDING_AGENCY_CONFIRMATION;
    }
}
