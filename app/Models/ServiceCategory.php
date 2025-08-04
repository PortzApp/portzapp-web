<?php

namespace App\Models;

use Database\Factories\ServiceCategoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Service> $services
 * @property-read int|null $services_count
 * @method static \Database\Factories\ServiceCategoryFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceCategory whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ServiceCategory extends Model
{
    /** @use HasFactory<ServiceCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
