<?php

namespace App\Events;

use App\Models\Service;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
// TEMPORARILY DISABLED - WebSocket functionality disabled in production
// use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

// TEMPORARILY DISABLED - WebSocket functionality disabled in production
class ServiceCreated // implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public User $user,
        public Service $service,
    ) {}

    // TEMPORARILY DISABLED - WebSocket functionality disabled in production
    // /**
    //  * Get the channels the event should broadcast on.
    //  */
    // public function broadcastOn(): PrivateChannel
    // {
    //     return new PrivateChannel('services');
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
    //         'message' => 'Service created successfully',
    //         'user' => [
    //             'id' => $this->user->id,
    //             'name' => $this->user->first_name.' '.$this->user->last_name,
    //             'email' => $this->user->email,
    //         ],
    //         'service' => $this->service->toArray(),
    //         'timestamp' => now()->toISOString(),
    //     ];
    // }
}
