<?php

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Organization;
use App\Models\User;

describe('OrderGroupObserver', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->organization = Organization::factory()->create();

        $this->order = Order::factory()->create([
            'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION,
        ]);
    });

    it('remains PENDING_AGENCY_CONFIRMATION when some OrderGroups are COMPLETED but others are still PENDING', function () {
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

    it('updates Order status to COMPLETED when all OrderGroups are COMPLETED', function () {
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

    it('updates Order status to CONFIRMED when all OrderGroups are ACCEPTED', function () {
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

    it('updates Order status to PARTIALLY_REJECTED when any OrderGroup is REJECTED', function () {
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

    it('updates Order status to PARTIALLY_ACCEPTED when some OrderGroups are ACCEPTED', function () {
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

    it('keeps Order status as PENDING_AGENCY_CONFIRMATION when all OrderGroups are PENDING', function () {
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

    it('updates Order status to DRAFT when all OrderGroups are deleted', function () {
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

    it('only updates Order when OrderGroup status field changes', function () {
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

    it('triggers on OrderGroup creation', function () {
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
});
