<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @method static create(array $array)
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
