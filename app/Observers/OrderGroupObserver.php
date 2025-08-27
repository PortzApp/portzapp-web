<?php

namespace App\Observers;

use App\Enums\OrderGroupServiceStatus;
use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Events\OrderGroupServiceUpdated;
use App\Events\OrderGroupUpdated;
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
            $this->updateChildOrderGroupServices($orderGroup);

            // Dispatch broadcasting event for real-time updates
            $user = auth()->user();
            if (! $user && $orderGroup->order) {
                $user = $orderGroup->order->placedByUser;
            }
            if ($user) {
                OrderGroupUpdated::dispatch($user, $orderGroup);
            }
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

        // Check for each status type
        $allCompleted = $orderGroupStatuses->every(fn ($status) => $status === OrderGroupStatus::COMPLETED);
        $allAccepted = $orderGroupStatuses->every(fn ($status) => $status === OrderGroupStatus::ACCEPTED);
        $allPending = $orderGroupStatuses->every(fn ($status) => $status === OrderGroupStatus::PENDING);

        $anyRejected = $orderGroupStatuses->contains(OrderGroupStatus::REJECTED);
        $anyAccepted = $orderGroupStatuses->contains(OrderGroupStatus::ACCEPTED);
        $anyInProgress = $orderGroupStatuses->contains(OrderGroupStatus::IN_PROGRESS);
        $anyCompleted = $orderGroupStatuses->contains(OrderGroupStatus::COMPLETED);

        // Business logic for Order status aggregation (in priority order)

        // Terminal state: any rejection means partial rejection
        if ($anyRejected) {
            return OrderStatus::PARTIALLY_REJECTED;
        }

        // All completed - final success state
        if ($allCompleted) {
            return OrderStatus::COMPLETED;
        }

        // Some completed, others in progress or accepted - partial completion
        if ($anyCompleted && ($anyInProgress || ($anyAccepted && ! $allAccepted))) {
            return OrderStatus::PARTIALLY_COMPLETED;
        }

        // At least one in progress
        if ($anyInProgress) {
            return OrderStatus::IN_PROGRESS;
        }

        // All accepted and none in progress/completed - confirmed and ready
        if ($allAccepted) {
            return OrderStatus::CONFIRMED;
        }

        // Some accepted, some pending - partial acceptance
        if ($anyAccepted) {
            return OrderStatus::PARTIALLY_ACCEPTED;
        }

        // Default: all OrderGroups are still pending
        return OrderStatus::PENDING_AGENCY_CONFIRMATION;
    }

    /**
     * Update child OrderGroupServices status when OrderGroup status changes.
     */
    private function updateChildOrderGroupServices(OrderGroup $orderGroup): void
    {
        // Define cascade rules based on OrderGroup status
        $status = $orderGroup->status instanceof OrderGroupStatus
            ? $orderGroup->status
            : OrderGroupStatus::from($orderGroup->status);
        $newServiceStatus = $this->getCascadeServiceStatus($status);

        if ($newServiceStatus === null) {
            // No cascade needed for this status
            return;
        }

        // Get services that should be updated based on cascade rules
        $servicesToUpdate = $orderGroup->orderGroupServices()
            ->when($newServiceStatus === OrderGroupServiceStatus::IN_PROGRESS, function ($query) {
                // For IN_PROGRESS: only update pending and accepted services
                return $query->whereIn('status', [
                    OrderGroupServiceStatus::PENDING,
                    OrderGroupServiceStatus::ACCEPTED,
                ]);
            })
            ->when($newServiceStatus === OrderGroupServiceStatus::ACCEPTED, function ($query) {
                // For ACCEPTED: only update pending services
                return $query->where('status', OrderGroupServiceStatus::PENDING);
            })
            ->get();

        // Update services without triggering their observers to prevent infinite loops
        $servicesToUpdate->each(function ($service) use ($newServiceStatus): void {
            /** @var \App\Models\OrderGroupService $service */
            $service->withoutEvents(function () use ($service, $newServiceStatus): void {
                $service->update(['status' => $newServiceStatus]);
            });

            // Manually dispatch OrderGroupServiceUpdated event since withoutEvents() prevents it
            $user = auth()->user();
            if (! $user) {
                $service->load('orderGroup.order.placedByUser');
                if ($service->orderGroup && $service->orderGroup->order) {
                    $user = $service->orderGroup->order->placedByUser;
                }
            }
            if ($user) {
                \App\Events\OrderGroupServiceUpdated::dispatch($user, $service->fresh());
            }
        });
    }

    /**
     * Get the target service status for cascade based on OrderGroup status.
     */
    private function getCascadeServiceStatus(OrderGroupStatus $orderGroupStatus): ?OrderGroupServiceStatus
    {
        return match ($orderGroupStatus) {
            OrderGroupStatus::COMPLETED => OrderGroupServiceStatus::COMPLETED,
            OrderGroupStatus::REJECTED => OrderGroupServiceStatus::REJECTED,
            OrderGroupStatus::IN_PROGRESS => OrderGroupServiceStatus::IN_PROGRESS,
            OrderGroupStatus::ACCEPTED => OrderGroupServiceStatus::ACCEPTED,
            OrderGroupStatus::PENDING => null, // No cascade for PENDING
        };
    }
}
