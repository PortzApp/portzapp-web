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
    public function broadcastOn(): PrivateChannel
    {
        return new PrivateChannel('order-group-services.updated');
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        // Load the orderGroup relationship to get order information
        $this->orderGroupService->load('orderGroup.order');

        return [
            'message' => 'Order group service updated successfully',
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->first_name.' '.$this->user->last_name,
                'email' => $this->user->email,
            ],
            'orderGroupService' => array_merge($this->orderGroupService->toArray(), [
                'order_group_id' => $this->orderGroupService->order_group_id,
                'order_id' => $this->orderGroupService->orderGroup?->order?->id,
            ]),
            'timestamp' => now()->toISOString(),
        ];
    }
}
