<?php

use App\Enums\OrderGroupServiceStatus;
use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderGroupService;
use App\Models\Organization;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Event;

describe('OrderGroupObserver', function (): void {
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
        $this->user = User::factory()->create();
        $this->organization = Organization::factory()->create();

        $this->order = Order::factory()->create([
            'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION,
        ]);
    });

    it('remains PENDING_AGENCY_CONFIRMATION when some OrderGroups are COMPLETED but others are still PENDING', function (): void {
        // Create three OrderGroups with different statuses
        $orderGroup1 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup2 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup3 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Update one OrderGroup to COMPLETED
        $orderGroup1->update(['status' => OrderGroupStatus::COMPLETED]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should still be PENDING_AGENCY_CONFIRMATION (waiting for other groups to be accepted)
        expect($this->order->status)->toBe(OrderStatus::PENDING_AGENCY_CONFIRMATION);
    });

    it('updates Order status to COMPLETED when all OrderGroups are COMPLETED', function (): void {
        // Create three OrderGroups
        $orderGroup1 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup2 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup3 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Update all OrderGroups to COMPLETED
        $orderGroup1->update(['status' => OrderGroupStatus::COMPLETED]);
        $orderGroup2->update(['status' => OrderGroupStatus::COMPLETED]);
        $orderGroup3->update(['status' => OrderGroupStatus::COMPLETED]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should now be COMPLETED
        expect($this->order->status)->toBe(OrderStatus::COMPLETED);
    });

    it('updates Order status to CONFIRMED when all OrderGroups are ACCEPTED', function (): void {
        // Create three OrderGroups
        $orderGroup1 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup2 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Update all OrderGroups to ACCEPTED
        $orderGroup1->update(['status' => OrderGroupStatus::ACCEPTED]);
        $orderGroup2->update(['status' => OrderGroupStatus::ACCEPTED]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should now be CONFIRMED
        expect($this->order->status)->toBe(OrderStatus::CONFIRMED);
    });

    it('updates Order status to PARTIALLY_REJECTED when any OrderGroup is REJECTED', function (): void {
        // Create three OrderGroups
        $orderGroup1 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::ACCEPTED,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup2 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::COMPLETED,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup3 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Update one OrderGroup to REJECTED
        $orderGroup3->update(['status' => OrderGroupStatus::REJECTED]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should now be PARTIALLY_REJECTED
        expect($this->order->status)->toBe(OrderStatus::PARTIALLY_REJECTED);
    });

    it('updates Order status to PARTIALLY_ACCEPTED when some OrderGroups are ACCEPTED', function (): void {
        // Create three OrderGroups
        $orderGroup1 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup2 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Update one OrderGroup to ACCEPTED
        $orderGroup1->update(['status' => OrderGroupStatus::ACCEPTED]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should now be PARTIALLY_ACCEPTED
        expect($this->order->status)->toBe(OrderStatus::PARTIALLY_ACCEPTED);
    });

    it('keeps Order status as PENDING_AGENCY_CONFIRMATION when all OrderGroups are PENDING', function (): void {
        // Create OrderGroups with PENDING status
        $orderGroup1 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        $orderGroup2 = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should remain PENDING_AGENCY_CONFIRMATION
        expect($this->order->status)->toBe(OrderStatus::PENDING_AGENCY_CONFIRMATION);
    });

    it('updates Order status to DRAFT when all OrderGroups are deleted', function (): void {
        // Create an OrderGroup
        $orderGroup = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::ACCEPTED,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Delete the OrderGroup
        $orderGroup->delete();

        // Refresh the Order from database
        $this->order->refresh();

        // Order should now be DRAFT
        expect($this->order->status)->toBe(OrderStatus::DRAFT);
    });

    it('only updates Order when OrderGroup status field changes', function (): void {
        // Create an OrderGroup
        $orderGroup = OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::PENDING,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Change the Order status manually for this test
        $this->order->update(['status' => OrderStatus::CONFIRMED]);

        // Update OrderGroup with a non-status field (notes)
        $orderGroup->update(['notes' => 'Some notes']);

        // Refresh the Order from database
        $this->order->refresh();

        // Order status should not have changed
        expect($this->order->status)->toBe(OrderStatus::CONFIRMED);
    });

    it('triggers on OrderGroup creation', function (): void {
        // Order starts with PENDING_AGENCY_CONFIRMATION
        expect($this->order->status)->toBe(OrderStatus::PENDING_AGENCY_CONFIRMATION);

        // Create an OrderGroup with COMPLETED status
        OrderGroup::factory()->create([
            'order_id' => $this->order->id,
            'status' => OrderGroupStatus::COMPLETED,
            'fulfilling_organization_id' => Organization::factory()->create()->id,
        ]);

        // Refresh the Order from database
        $this->order->refresh();

        // Order should now be COMPLETED (since all OrderGroups are COMPLETED)
        expect($this->order->status)->toBe(OrderStatus::COMPLETED);
    });

    describe('cascade status updates to OrderGroupServices', function (): void {
        beforeEach(function (): void {
            $this->orderGroup = OrderGroup::factory()->create([
                'order_id' => $this->order->id,
                'status' => OrderGroupStatus::PENDING,
                'fulfilling_organization_id' => $this->organization->id,
            ]);

            // Create services for this OrderGroup
            $this->service1 = Service::factory()->create(['organization_id' => $this->organization->id]);
            $this->service2 = Service::factory()->create(['organization_id' => $this->organization->id]);
            $this->service3 = Service::factory()->create(['organization_id' => $this->organization->id]);

            $this->orderGroupService1 = OrderGroupService::factory()->create([
                'order_group_id' => $this->orderGroup->id,
                'service_id' => $this->service1->id,
                'status' => OrderGroupServiceStatus::PENDING,
            ]);

            $this->orderGroupService2 = OrderGroupService::factory()->create([
                'order_group_id' => $this->orderGroup->id,
                'service_id' => $this->service2->id,
                'status' => OrderGroupServiceStatus::PENDING,
            ]);

            $this->orderGroupService3 = OrderGroupService::factory()->create([
                'order_group_id' => $this->orderGroup->id,
                'service_id' => $this->service3->id,
                'status' => OrderGroupServiceStatus::ACCEPTED,
            ]);
        });

        it('cascades COMPLETED status to all OrderGroupServices', function (): void {
            // Update OrderGroup to COMPLETED
            $this->orderGroup->update(['status' => OrderGroupStatus::COMPLETED]);

            // Refresh all services from database
            $this->orderGroupService1->refresh();
            $this->orderGroupService2->refresh();
            $this->orderGroupService3->refresh();

            // All services should be COMPLETED
            expect($this->orderGroupService1->status)->toBe(OrderGroupServiceStatus::COMPLETED);
            expect($this->orderGroupService2->status)->toBe(OrderGroupServiceStatus::COMPLETED);
            expect($this->orderGroupService3->status)->toBe(OrderGroupServiceStatus::COMPLETED);
        });

        it('cascades REJECTED status to all OrderGroupServices', function (): void {
            // Update OrderGroup to REJECTED
            $this->orderGroup->update(['status' => OrderGroupStatus::REJECTED]);

            // Refresh all services from database
            $this->orderGroupService1->refresh();
            $this->orderGroupService2->refresh();
            $this->orderGroupService3->refresh();

            // All services should be REJECTED
            expect($this->orderGroupService1->status)->toBe(OrderGroupServiceStatus::REJECTED);
            expect($this->orderGroupService2->status)->toBe(OrderGroupServiceStatus::REJECTED);
            expect($this->orderGroupService3->status)->toBe(OrderGroupServiceStatus::REJECTED);
        });

        it('cascades IN_PROGRESS status only to PENDING and ACCEPTED services', function (): void {
            // Update OrderGroup to IN_PROGRESS
            $this->orderGroup->update(['status' => OrderGroupStatus::IN_PROGRESS]);

            // Refresh all services from database
            $this->orderGroupService1->refresh();
            $this->orderGroupService2->refresh();
            $this->orderGroupService3->refresh();

            // PENDING services should become IN_PROGRESS
            expect($this->orderGroupService1->status)->toBe(OrderGroupServiceStatus::IN_PROGRESS);
            expect($this->orderGroupService2->status)->toBe(OrderGroupServiceStatus::IN_PROGRESS);
            // ACCEPTED service should become IN_PROGRESS
            expect($this->orderGroupService3->status)->toBe(OrderGroupServiceStatus::IN_PROGRESS);
        });

        it('cascades ACCEPTED status only to PENDING services', function (): void {
            // Update OrderGroup to ACCEPTED
            $this->orderGroup->update(['status' => OrderGroupStatus::ACCEPTED]);

            // Refresh all services from database
            $this->orderGroupService1->refresh();
            $this->orderGroupService2->refresh();
            $this->orderGroupService3->refresh();

            // PENDING services should become ACCEPTED
            expect($this->orderGroupService1->status)->toBe(OrderGroupServiceStatus::ACCEPTED);
            expect($this->orderGroupService2->status)->toBe(OrderGroupServiceStatus::ACCEPTED);
            // Already ACCEPTED service should stay ACCEPTED
            expect($this->orderGroupService3->status)->toBe(OrderGroupServiceStatus::ACCEPTED);
        });

        it('does not cascade when OrderGroup status is set to PENDING', function (): void {
            // Create a new OrderGroup with specific services to avoid observer conflicts
            $newOrderGroup = OrderGroup::factory()->create([
                'order_id' => $this->order->id,
                'status' => OrderGroupStatus::ACCEPTED, // Start with ACCEPTED
                'fulfilling_organization_id' => $this->organization->id,
            ]);

            $service1 = OrderGroupService::factory()->create([
                'order_group_id' => $newOrderGroup->id,
                'service_id' => $this->service1->id,
                'status' => OrderGroupServiceStatus::ACCEPTED,
            ]);

            $service2 = OrderGroupService::factory()->create([
                'order_group_id' => $newOrderGroup->id,
                'service_id' => $this->service2->id,
                'status' => OrderGroupServiceStatus::COMPLETED,
            ]);

            // Update OrderGroup to PENDING (should not cascade to children)
            // Disable observers to prevent the OrderGroupServiceObserver from changing it back
            $newOrderGroup->withoutEvents(function () use ($newOrderGroup): void {
                $newOrderGroup->update(['status' => OrderGroupStatus::PENDING]);
            });

            // Manually trigger our cascade method to test it directly
            $observer = new App\Observers\OrderGroupObserver;
            $reflection = new ReflectionClass($observer);
            $method = $reflection->getMethod('updateChildOrderGroupServices');
            $method->setAccessible(true);

            // Call the cascade method directly
            $method->invoke($observer, $newOrderGroup->fresh());

            // Refresh services from database
            $service1->refresh();
            $service2->refresh();

            // Services should maintain their original statuses (PENDING doesn't cascade)
            expect($service1->status)->toBe(OrderGroupServiceStatus::ACCEPTED);
            expect($service2->status)->toBe(OrderGroupServiceStatus::COMPLETED);
        });

        it('prevents infinite observer loops during cascade', function (): void {
            // This test ensures that cascading doesn't trigger OrderGroupServiceObserver
            // which would try to update the OrderGroup status again

            // Update OrderGroup to COMPLETED
            $this->orderGroup->update(['status' => OrderGroupStatus::COMPLETED]);

            // Refresh OrderGroup from database
            $this->orderGroup->refresh();

            // OrderGroup should still be COMPLETED (not changed by child observer)
            expect($this->orderGroup->status)->toBe(OrderGroupStatus::COMPLETED);

            // And all services should be COMPLETED
            $this->orderGroupService1->refresh();
            $this->orderGroupService2->refresh();
            $this->orderGroupService3->refresh();

            expect($this->orderGroupService1->status)->toBe(OrderGroupServiceStatus::COMPLETED);
            expect($this->orderGroupService2->status)->toBe(OrderGroupServiceStatus::COMPLETED);
            expect($this->orderGroupService3->status)->toBe(OrderGroupServiceStatus::COMPLETED);
        });
    });
});
