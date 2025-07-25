<?php

namespace App\Models;

use App\Enums\VesselStatus;
use App\Enums\VesselType;
use Database\Factories\VesselFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @method static create(string[] $array)
 */
class Vessel extends Model
{
    /** @use HasFactory<VesselFactory> */
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'imo_number',
        'status',
        'vessel_type',
    ];

    /**
     * Get the user that owns the vessel.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class);
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
