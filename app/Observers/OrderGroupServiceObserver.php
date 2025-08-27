<?php

namespace App\Observers;

use App\Enums\OrderGroupServiceStatus;
use App\Enums\OrderGroupStatus;
use App\Events\OrderGroupServiceUpdated;
use App\Models\OrderGroupService;

class OrderGroupServiceObserver
{
    /**
     * Handle the OrderGroupService "created" event.
     */
    public function created(OrderGroupService $orderGroupService): void
    {
        $this->updateParentOrderGroupStatus($orderGroupService);
    }

    /**
     * Handle the OrderGroupService "updated" event.
     */
    public function updated(OrderGroupService $orderGroupService): void
    {
        // Only update parent OrderGroup if the status field was changed
        if ($orderGroupService->wasChanged('status')) {
            $this->updateParentOrderGroupStatus($orderGroupService);

            // Dispatch broadcasting event for real-time updates
            $user = auth()->user();
            if (! $user) {
                $orderGroupService->load('orderGroup.order.placedByUser');
                $orderGroup = $orderGroupService->orderGroup;
                if ($orderGroup && $orderGroup->order) {
                    $user = $orderGroup->order->placedByUser;
                }
            }
            if ($user) {
                OrderGroupServiceUpdated::dispatch($user, $orderGroupService);
            }
        }
    }

    /**
     * Handle the OrderGroupService "deleted" event.
     */
    public function deleted(OrderGroupService $orderGroupService): void
    {
        $this->updateParentOrderGroupStatus($orderGroupService);
    }

    /**
     * Handle the OrderGroupService "restored" event.
     */
    public function restored(OrderGroupService $orderGroupService): void
    {
        $this->updateParentOrderGroupStatus($orderGroupService);
    }

    /**
     * Handle the OrderGroupService "force deleted" event.
     */
    public function forceDeleted(OrderGroupService $orderGroupService): void
    {
        $this->updateParentOrderGroupStatus($orderGroupService);
    }

    /**
     * Update the parent OrderGroup's status based on all OrderGroupService statuses.
     */
    private function updateParentOrderGroupStatus(OrderGroupService $orderGroupService): void
    {
        /** @var \App\Models\OrderGroup|null $orderGroup */
        $orderGroup = $orderGroupService->orderGroup;

        if (! $orderGroup) {
            return;
        }

        // Get all OrderGroupService statuses for this OrderGroup (excluding the deleted one for delete events)
        $serviceStatuses = $orderGroup->orderGroupServices()
            ->when($orderGroupService->exists, function ($query) {
                // For updates, include the current OrderGroupService
                return $query;
            }, function ($query) use ($orderGroupService) {
                // For deletes, exclude the deleted OrderGroupService
                return $query->where('id', '!=', $orderGroupService->id);
            })
            ->pluck('status')
            ->map(fn ($status) => $status instanceof OrderGroupServiceStatus ? $status : OrderGroupServiceStatus::from($status));

        if ($serviceStatuses->isEmpty()) {
            // If no OrderGroupServices remain, set OrderGroup to PENDING
            $newOrderGroupStatus = OrderGroupStatus::PENDING;
        } else {
            $newOrderGroupStatus = $this->calculateOrderGroupStatus($serviceStatuses);
        }

        // Only update if the status actually needs to change
        if ($orderGroup->status !== $newOrderGroupStatus) {
            // Use withoutEvents to prevent triggering cascade logic during automatic aggregation
            $orderGroup->withoutEvents(function () use ($orderGroup, $newOrderGroupStatus): void {
                $orderGroup->update(['status' => $newOrderGroupStatus]);
            });

            // Manually dispatch OrderGroupUpdated event since withoutEvents() prevents it
            $user = auth()->user();
            if (! $user) {
                $orderGroup->load('order.placedByUser');
                if ($orderGroup->order) {
                    $user = $orderGroup->order->placedByUser;
                }
            }
            if ($user) {
                \App\Events\OrderGroupUpdated::dispatch($user, $orderGroup->fresh());
            }
        }
    }

    /**
     * Calculate the aggregated OrderGroup status based on OrderGroupService statuses.
     */
    private function calculateOrderGroupStatus($serviceStatuses): OrderGroupStatus
    {
        // Check for each status type
        $allCompleted = $serviceStatuses->every(fn ($status) => $status === OrderGroupServiceStatus::COMPLETED);
        $allAccepted = $serviceStatuses->every(fn ($status) => $status === OrderGroupServiceStatus::ACCEPTED);
        $allPending = $serviceStatuses->every(fn ($status) => $status === OrderGroupServiceStatus::PENDING);

        $anyRejected = $serviceStatuses->contains(OrderGroupServiceStatus::REJECTED);
        $anyInProgress = $serviceStatuses->contains(OrderGroupServiceStatus::IN_PROGRESS);
        $anyAccepted = $serviceStatuses->contains(OrderGroupServiceStatus::ACCEPTED);
        $anyCompleted = $serviceStatuses->contains(OrderGroupServiceStatus::COMPLETED);

        // Business logic for OrderGroup status aggregation (in priority order)

        // Terminal state: any rejection
        if ($anyRejected) {
            return OrderGroupStatus::REJECTED;
        }

        // All completed - final success state
        if ($allCompleted) {
            return OrderGroupStatus::COMPLETED;
        }

        // At least one in progress
        if ($anyInProgress) {
            return OrderGroupStatus::IN_PROGRESS;
        }

        // All accepted and none in progress/completed - ready to begin
        if ($allAccepted) {
            return OrderGroupStatus::ACCEPTED;
        }

        // Some accepted, some pending - partial acceptance (still counts as accepted)
        if ($anyAccepted) {
            return OrderGroupStatus::ACCEPTED;
        }

        // Default: all OrderGroupServices are still pending
        return OrderGroupStatus::PENDING;
    }
}
