<?php

use App\Enums\OrderGroupServiceStatus;
use App\Enums\OrderGroupStatus;
use App\Models\OrderGroup;
use App\Models\OrderGroupService;
use App\Models\Service;
use Illuminate\Support\Facades\Event;

describe('OrderGroupServiceObserver', function (): void {
    beforeEach(function (): void {
        // Fake only the broadcast events to prevent WebSocket connection issues
        // but allow observers to run normally
        Event::fake([
            \App\Events\OrderUpdated::class,
            \App\Events\OrderGroupUpdated::class,
            \App\Events\OrderGroupServiceUpdated::class,
            \App\Events\ServiceUpdated::class,
            \App\Events\ServiceCreated::class,
            \App\Events\ServiceDeleted::class,
        ]);
        $this->orderGroup = OrderGroup::factory()->create([
            'status' => OrderGroupStatus::PENDING,
        ]);

        $this->service1 = Service::factory()->create();
        $this->service2 = Service::factory()->create();
        $this->service3 = Service::factory()->create();
    });

    it('updates OrderGroup status to ACCEPTED when all OrderGroupServices are ACCEPTED', function (): void {
        // Create OrderGroupServices with PENDING status
        $orderGroupService1 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::PENDING,
        ]);

        $orderGroupService2 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::PENDING,
        ]);

        // Update both to ACCEPTED
        $orderGroupService1->update(['status' => OrderGroupServiceStatus::ACCEPTED]);
        $orderGroupService2->update(['status' => OrderGroupServiceStatus::ACCEPTED]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should now be ACCEPTED
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::ACCEPTED);
    });

    it('updates OrderGroup status to COMPLETED when all OrderGroupServices are COMPLETED', function (): void {
        // Create OrderGroupServices
        $orderGroupService1 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        $orderGroupService2 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        // Update both to COMPLETED
        $orderGroupService1->update(['status' => OrderGroupServiceStatus::COMPLETED]);
        $orderGroupService2->update(['status' => OrderGroupServiceStatus::COMPLETED]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should now be COMPLETED
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::COMPLETED);
    });

    it('updates OrderGroup status to REJECTED when any OrderGroupService is REJECTED', function (): void {
        // Create OrderGroupServices
        $orderGroupService1 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        $orderGroupService2 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::COMPLETED,
        ]);

        $orderGroupService3 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service3->id,
            'status' => OrderGroupServiceStatus::PENDING,
        ]);

        // Reject one service
        $orderGroupService3->update(['status' => OrderGroupServiceStatus::REJECTED]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should now be REJECTED
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::REJECTED);
    });

    it('updates OrderGroup status to IN_PROGRESS when any OrderGroupService is IN_PROGRESS', function (): void {
        // Create OrderGroupServices
        $orderGroupService1 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        $orderGroupService2 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        // Start progress on one service
        $orderGroupService1->update(['status' => OrderGroupServiceStatus::IN_PROGRESS]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should now be IN_PROGRESS
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::IN_PROGRESS);
    });

    it('keeps OrderGroup status as PENDING when all OrderGroupServices are PENDING', function (): void {
        // Create OrderGroupServices with PENDING status
        OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::PENDING,
        ]);

        OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::PENDING,
        ]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should remain PENDING
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::PENDING);
    });

    it('only updates OrderGroup when OrderGroupService status field changes', function (): void {
        // Create an OrderGroupService
        $orderGroupService = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::PENDING,
        ]);

        // Change the OrderGroup status manually for this test
        $this->orderGroup->update(['status' => OrderGroupStatus::ACCEPTED]);

        // Update OrderGroupService with a non-status field (notes)
        $orderGroupService->update(['notes' => 'Some service notes']);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup status should not have changed
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::ACCEPTED);
    });

    it('triggers on OrderGroupService creation', function (): void {
        // OrderGroup starts with PENDING
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::PENDING);

        // Create an OrderGroupService with ACCEPTED status
        OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should now be ACCEPTED (since all OrderGroupServices are ACCEPTED)
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::ACCEPTED);
    });

    it('triggers on OrderGroupService deletion', function (): void {
        // Create two OrderGroupServices
        $orderGroupService1 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        $orderGroupService2 = OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::REJECTED,
        ]);

        // OrderGroup should be REJECTED due to one rejected service
        $this->orderGroup->refresh();
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::REJECTED);

        // Delete the rejected service
        $orderGroupService2->delete();

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should now be ACCEPTED (since only accepted services remain)
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::ACCEPTED);
    });

    it('handles mixed statuses correctly with priority order', function (): void {
        // Create OrderGroupServices with mixed statuses
        OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service1->id,
            'status' => OrderGroupServiceStatus::COMPLETED,
        ]);

        OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service2->id,
            'status' => OrderGroupServiceStatus::IN_PROGRESS,
        ]);

        OrderGroupService::factory()->create([
            'order_group_id' => $this->orderGroup->id,
            'service_id' => $this->service3->id,
            'status' => OrderGroupServiceStatus::ACCEPTED,
        ]);

        // Refresh the OrderGroup from database
        $this->orderGroup->refresh();

        // OrderGroup should be IN_PROGRESS (highest priority among mixed statuses)
        expect($this->orderGroup->status)->toBe(OrderGroupStatus::IN_PROGRESS);
    });
});
