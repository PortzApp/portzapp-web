<?php

namespace App\Events;

use App\Models\OrderGroup;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
// TEMPORARILY DISABLED - WebSocket functionality disabled in production
// use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// TEMPORARILY DISABLED - WebSocket functionality disabled in production
class OrderGroupUpdated // implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
        public OrderGroup $orderGroup,
    ) {}

    // TEMPORARILY DISABLED - WebSocket functionality disabled in production
    // /**
    //  * Get the channels the event should broadcast on.
    //  */
    // public function broadcastOn(): PrivateChannel
    // {
    //     return new PrivateChannel('order-groups.updated');
    // }
    //
    // /**
    //  * Get the data to broadcast.
    //  *
    //  * @return array<string, mixed>
    //  */
    // public function broadcastWith(): array
    // {
    //     return [
    //         'message' => 'Order group updated successfully',
    //         'user' => [
    //             'id' => $this->user->id,
    //             'name' => $this->user->first_name.' '.$this->user->last_name,
    //             'email' => $this->user->email,
    //         ],
    //         'orderGroup' => array_merge($this->orderGroup->toArray(), [
    //             'order_id' => $this->orderGroup->order_id,
    //         ]),
    //         'timestamp' => now()->toISOString(),
    //     ];
    // }
}
