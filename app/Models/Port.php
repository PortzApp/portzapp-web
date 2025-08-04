<?php

namespace App\Models;

use Database\Factories\PortFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @method static create(mixed $validated)
 *
 * @property int $id
 * @property string $name
 * @property string $code
 * @property string $status
 * @property string $country
 * @property string $city
 * @property string|null $latitude
 * @property string|null $longitude
 * @property string $timezone
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Service> $services
 * @property-read int|null $services_count
 *
 * @method static \Database\Factories\PortFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereCity($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereCountry($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Port whereUpdatedAt($value)
 *
 * @mixin Eloquent
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
