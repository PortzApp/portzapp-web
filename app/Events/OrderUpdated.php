<?php

namespace App\Events;

use App\Models\Order;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
// TEMPORARILY DISABLED - WebSocket functionality disabled in production
// use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// TEMPORARILY DISABLED - WebSocket functionality disabled in production
class OrderUpdated // implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
        public Order $order,
    ) {}

    // TEMPORARILY DISABLED - WebSocket functionality disabled in production
    // /**
    //  * Get the channels the event should broadcast on.
    //  */
    // public function broadcastOn(): PrivateChannel
    // {
    //     return new PrivateChannel('orders.updated');
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
    //         'message' => 'Order updated successfully',
    //         'user' => [
    //             'id' => $this->user->id,
    //             'name' => $this->user->first_name.' '.$this->user->last_name,
    //             'email' => $this->user->email,
    //         ],
    //         'order' => array_merge($this->order->toArray(), [
    //             'id' => $this->order->id,
    //             'order_number' => $this->order->order_number,
    //         ]),
    //         'timestamp' => now()->toISOString(),
    //     ];
    // }
}
