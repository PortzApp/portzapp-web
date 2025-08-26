<?php

namespace App\Models;

use App\Enums\VesselStatus;
use App\Enums\VesselType;
use Database\Factories\VesselFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @method static create(string[] $array)
 *
 * @property string $id
 * @property string $organization_id
 * @property string $name
 * @property string $imo_number
 * @property VesselType $vessel_type
 * @property VesselStatus $status
 * @property float|null $grt
 * @property float|null $nrt
 * @property int|null $dwt
 * @property int|null $loa
 * @property int|null $beam
 * @property int|null $draft
 * @property int|null $build_year
 * @property string|null $mmsi
 * @property string|null $call_sign
 * @property string|null $flag_state
 * @property string|null $remarks
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Order> $orders
 * @property-read int|null $orders_count
 * @property-read Organization $organization
 * @property-read float|null $dwt_in_tons
 * @property-read float|null $loa_in_meters
 * @property-read float|null $beam_in_meters
 * @property-read float|null $draft_in_meters
 *
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
 *
 * @mixin Eloquent
 */
class Vessel extends Model
{
    /** @use HasFactory<VesselFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'organization_id',
        'name',
        'imo_number',
        'status',
        'vessel_type',
        'grt',
        'nrt',
        'dwt',
        'loa',
        'beam',
        'draft',
        'build_year',
        'mmsi',
        'call_sign',
        'flag_state',
        'remarks',
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

    /**
     * Get the DWT in metric tons (for display purposes).
     */
    public function getDwtInTonsAttribute(): ?float
    {
        return $this->dwt ? round($this->dwt / 1000, 2) : null;
    }

    /**
     * Get the LOA in meters (for display purposes).
     */
    public function getLoaInMetersAttribute(): ?float
    {
        return $this->loa ? round($this->loa / 1000, 2) : null;
    }

    /**
     * Get the Beam in meters (for display purposes).
     */
    public function getBeamInMetersAttribute(): ?float
    {
        return $this->beam ? round($this->beam / 1000, 2) : null;
    }

    /**
     * Get the Draft in meters (for display purposes).
     */
    public function getDraftInMetersAttribute(): ?float
    {
        return $this->draft ? round($this->draft / 1000, 2) : null;
    }
}
