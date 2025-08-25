<?php

namespace App\Events;

use App\Models\OrderGroup;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderGroupUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
        public OrderGroup $orderGroup,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        return [
            // Organization-scoped channel for index pages
            new PrivateChannel('order-groups.organization.'.$this->orderGroup->fulfilling_organization_id),
            // Resource-specific channel for detail pages
            new PrivateChannel('order-groups.'.$this->orderGroup->id),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'message' => 'Order group updated successfully',
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->first_name.' '.$this->user->last_name,
                'email' => $this->user->email,
            ],
            'orderGroup' => $this->orderGroup->toArray(),
            'timestamp' => now()->toISOString(),
        ];
    }
}
