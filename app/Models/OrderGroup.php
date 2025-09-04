<?php

namespace App\Models;

use App\Enums\OrderGroupStatus;
use Database\Factories\OrderGroupFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $group_number
 * @property string $order_id
 * @property string $fulfilling_organization_id
 * @property string $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Order $order
 * @property-read Organization $fulfillingOrganization
 * @property-read Collection<int, OrderGroupService> $orderGroupServices
 * @property-read int|null $order_group_services_count
 * @property-read Collection<int, Service> $services
 * @property-read float $total_price
 *
 * @method static \Database\Factories\OrderGroupFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderGroup newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderGroup newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|OrderGroup query()
 *
 * @mixin Eloquent
 */
class OrderGroup extends Model
{
    /** @use HasFactory<OrderGroupFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'group_number',
        'order_id',
        'fulfilling_organization_id',
        'status',
        'notes',
    ];

    protected $appends = [
        'total_price',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function fulfillingOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'fulfilling_organization_id');
    }

    public function orderGroupServices(): HasMany
    {
        return $this->hasMany(OrderGroupService::class);
    }

    /**
     * Get services through OrderGroupService relationship (backward compatibility).
     * This provides a BelongsToMany relationship for the existing tests.
     */
    public function services()
    {
        return $this->belongsToMany(\App\Models\Service::class, 'order_group_services')
            ->withPivot(['status', 'notes', 'price_snapshot'])
            ->withTimestamps();
    }

    /**
     * Helper method to get services collection for backward compatibility.
     */
    public function getServicesAttribute(): \Illuminate\Support\Collection
    {
        return $this->orderGroupServices->pluck('service');
    }

    /**
     * Get the chat conversation for this order group.
     */
    public function chatConversation(): HasOne
    {
        return $this->hasOne(\App\Models\ChatConversation::class, 'order_group_id');
    }

    /**
     * Calculate the total price for this order group from all OrderGroupServices.
     */
    public function getTotalPriceAttribute(): float
    {
        return (float) $this->orderGroupServices()->sum('price_snapshot');
    }

    /**
     * Get all chat messages for this order group through conversation.
     */
    public function chatMessages(): HasManyThrough
    {
        return $this->hasManyThrough(
            \App\Models\ChatMessage::class,
            \App\Models\ChatConversation::class,
            'order_group_id', // Foreign key on conversations table
            'conversation_id', // Foreign key on messages table
            'id', // Local key on order_groups table
            'id' // Local key on conversations table
        )->whereNull('chat_messages.deleted_at')->orderBy('chat_messages.created_at');
    }

    protected function casts(): array
    {
        return [
            'status' => OrderGroupStatus::class,
        ];
    }
}
