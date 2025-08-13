<?php

namespace App\Models;

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use Database\Factories\OrderFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @method static create(array $array)
 *
 * @property int $id
 * @property string $vessel_id
 * @property string $placed_by_organization_id
 * @property string|null $notes
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Vessel $vessel
 * @property-read Organization $placedByOrganization
 * @property-read User $placedByUser
 * @property-read Collection<int, OrderGroup> $orderGroups
 * @property-read int|null $order_groups_count
 * @property-read Collection<int, Service> $services
 * @property-read int|null $services_count
 * @property-read float $total_price
 * @property-read Collection<int, Organization> $providing_organizations
 *
 * @method static \Database\Factories\OrderFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRequestingOrganizationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'order_number',
        'vessel_id',
        'port_id',
        'placed_by_user_id',
        'placed_by_organization_id',
        'notes',
        'status',
    ];

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }

    public function port(): BelongsTo
    {
        return $this->belongsTo(Port::class);
    }

    public function placedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'placed_by_user_id');
    }

    public function placedByOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'placed_by_organization_id');
    }

    public function orderGroups(): HasMany
    {
        return $this->hasMany(OrderGroup::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'order_service')
            ->as('orderService')
            ->withTimestamps();
    }

    /**
     * Calculate the total price for this order from all order groups.
     */
    public function getTotalPriceAttribute(): float
    {
        return (float) $this->orderGroups->sum('total_price');
    }

    /**
     * Get all services across all order groups for this order.
     */
    public function getAllServicesAttribute(): \Illuminate\Support\Collection
    {
        return $this->orderGroups->flatMap(function ($orderGroup) {
            return $orderGroup->services;
        });
    }

    /**
     * Get all unique organizations that are fulfilling order groups for this order.
     */
    public function getProvidingOrganizationsAttribute(): \Illuminate\Support\Collection
    {
        return $this->orderGroups->pluck('fulfillingOrganization')
            ->unique('id')
            ->values();
    }

    /**
     * Calculate aggregate status based on order group statuses.
     */
    public function getAggregatedStatusAttribute(): OrderStatus
    {
        $groupStatuses = $this->orderGroups->pluck('status');

        if ($groupStatuses->isEmpty()) {
            return $this->status;
        }

        $allAccepted = $groupStatuses->every(fn ($status) => $status === OrderGroupStatus::ACCEPTED);
        $allCompleted = $groupStatuses->every(fn ($status) => $status === OrderGroupStatus::COMPLETED);
        $anyRejected = $groupStatuses->contains(OrderGroupStatus::REJECTED);
        $anyAccepted = $groupStatuses->contains(OrderGroupStatus::ACCEPTED);

        if ($allCompleted) {
            return OrderStatus::CONFIRMED;
        }

        if ($allAccepted) {
            return OrderStatus::CONFIRMED;
        }

        if ($anyRejected) {
            return OrderStatus::CANCELLED;
        }

        if ($anyAccepted) {
            return OrderStatus::PARTIALLY_CONFIRMED;
        }

        return OrderStatus::PENDING_AGENCY_CONFIRMATION;
    }

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
        ];
    }
}
