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
class ServiceUpdated // implements ShouldBroadcastNow
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
    // public function broadcastOn(): array
    // {
    //     return [
    //         // Organization-scoped channel for index pages
    //         new PrivateChannel('services.organization.'.$this->service->organization_id),
    //         // Resource-specific channel for detail pages
    //         new PrivateChannel('services.'.$this->service->id),
    //     ];
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
    //         'message' => 'Service updated successfully',
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
