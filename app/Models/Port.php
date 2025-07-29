<?php

namespace App\Models;

use Database\Factories\PortFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @method static create(mixed $validated)
 */
class Port extends Model
{
    /** @use HasFactory<PortFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'status',
        'country',
        'city',
        'latitude',
        'longitude',
        'timezone',
    ];

    /**
     * Get the services for the port.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
