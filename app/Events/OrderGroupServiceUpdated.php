<?php

namespace App\Events;

use App\Models\OrderGroupService;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderGroupServiceUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
        public OrderGroupService $orderGroupService,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        $channels = [];

        // Load relationships if not already loaded
        $this->orderGroupService->loadMissing(['orderGroup', 'service']);

        // Organization-scoped channels for index pages
        if ($this->orderGroupService->orderGroup) {
            $channels[] = new PrivateChannel('order-group-services.organization.'.$this->orderGroupService->orderGroup->fulfilling_organization_id);
        }

        if ($this->orderGroupService->service) {
            $channels[] = new PrivateChannel('order-group-services.organization.'.$this->orderGroupService->service->organization_id);
        }

        // Resource-specific channel for detail pages
        $channels[] = new PrivateChannel('order-group-services.'.$this->orderGroupService->id);

        return array_unique($channels, SORT_REGULAR);
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'message' => 'Order group service updated successfully',
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->first_name.' '.$this->user->last_name,
                'email' => $this->user->email,
            ],
            'orderGroupService' => $this->orderGroupService->toArray(),
            'timestamp' => now()->toISOString(),
        ];
    }
}
