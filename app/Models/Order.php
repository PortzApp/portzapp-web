<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @method static create(array $array)
 * @property int $id
 * @property int $vessel_id
 * @property int $requesting_organization_id
 * @property int $providing_organization_id
 * @property string $price
 * @property string|null $notes
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Organization $providingOrganization
 * @property-read Organization $requestingOrganization
 * @property-read Collection<int, Service> $services
 * @property-read int|null $services_count
 * @property-read Vessel $vessel
 * @method static \Database\Factories\OrderFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereProvidingOrganizationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereRequestingOrganizationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Order whereVesselId($value)
 * @mixin \Eloquent
 */
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'vessel_id',
        'requesting_organization_id',
        'providing_organization_id',
        'price',
        'notes',
        'status',
    ];

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'order_service')
            ->as('orderService')
            ->withTimestamps();
    }

    public function requestingOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'requesting_organization_id');
    }

    public function providingOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'providing_organization_id');
    }

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }
}
