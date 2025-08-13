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
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
 * @property-read Collection<int, Service> $services
 * @property-read int|null $services_count
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

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function fulfillingOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'fulfilling_organization_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'order_group_service')
            ->as('orderGroupService')
            ->withTimestamps();
    }

    /**
     * Calculate the total price for this order group from all associated services.
     */
    public function getTotalPriceAttribute(): float
    {
        return (float) $this->services()->sum('price');
    }

    protected function casts(): array
    {
        return [
            'status' => OrderGroupStatus::class,
        ];
    }
}
