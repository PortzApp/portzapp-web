<?php

namespace App\Models;

use App\Enums\VesselStatus;
use App\Enums\VesselType;
use Database\Factories\VesselFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @method static create(string[] $array)
 * @property int $id
 * @property int $organization_id
 * @property string $name
 * @property string $imo_number
 * @property VesselType $vessel_type
 * @property VesselStatus $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Order> $orders
 * @property-read int|null $orders_count
 * @property-read Organization $organization
 * @method static \Database\Factories\VesselFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereImoNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereOrganizationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Vessel whereVesselType($value)
 * @mixin Eloquent
 */
class Vessel extends Model
{
    /** @use HasFactory<VesselFactory> */
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'name',
        'imo_number',
        'status',
        'vessel_type',
    ];

    /**
     * Get the organization that owns the vessel.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the orders for the current vessel.
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'vessel_type' => VesselType::class,
            'status' => VesselStatus::class,
        ];
    }
}
