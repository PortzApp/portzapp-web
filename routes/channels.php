<?php

use App\Enums\OrganizationBusinessType;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderGroupService;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

// Organization-scoped channels for index pages
Broadcast::channel('services.organization.{organizationId}', function (User $user, string $organizationId) {
    return $user->current_organization_id === $organizationId;
});

Broadcast::channel('orders.organization.{organizationId}', function (User $user, string $organizationId) {
    return $user->current_organization_id === $organizationId;
});

Broadcast::channel('order-groups.organization.{organizationId}', function (User $user, string $organizationId) {
    return $user->current_organization_id === $organizationId;
});

Broadcast::channel('order-group-services.organization.{organizationId}', function (User $user, string $organizationId) {
    return $user->current_organization_id === $organizationId;
});

// Resource-specific channels for detail pages
Broadcast::channel('services.{serviceId}', function (User $user, string $serviceId) {
    $service = Service::find($serviceId);

    if (! $service) {
        return false;
    }

    // PortzApp team can access all services
    if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
        return true;
    }

    // Users can access services from their current organization
    return $service->organization_id === $user->current_organization_id;
});

Broadcast::channel('orders.{orderId}', function (User $user, string $orderId) {
    $order = Order::find($orderId);

    if (! $order) {
        return false;
    }

    // PortzApp team can access all orders
    if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
        return true;
    }

    // Users can access orders from their current organization
    return $order->placed_by_organization_id === $user->current_organization_id;
});

Broadcast::channel('order-groups.{orderGroupId}', function (User $user, string $orderGroupId) {
    $orderGroup = OrderGroup::find($orderGroupId);

    if (! $orderGroup) {
        return false;
    }

    // PortzApp team can access all order groups
    if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
        return true;
    }

    // Users can access order groups from their current organization
    return $orderGroup->fulfilling_organization_id === $user->current_organization_id;
});

Broadcast::channel('order-group-services.{orderGroupServiceId}', function (User $user, string $orderGroupServiceId) {
    $orderGroupService = OrderGroupService::with(['orderGroup', 'service'])->find($orderGroupServiceId);

    if (! $orderGroupService) {
        return false;
    }

    // PortzApp team can access all order group services
    if ($user->isInOrganizationWithBusinessType(OrganizationBusinessType::PORTZAPP_TEAM)) {
        return true;
    }

    // Users can access order group services if they own the order group or the service
    return $orderGroupService->orderGroup->fulfilling_organization_id === $user->current_organization_id
        || $orderGroupService->service->organization_id === $user->current_organization_id;
});
