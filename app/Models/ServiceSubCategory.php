<?php

namespace App\Models;

use Database\Factories\ServiceSubCategoryFactory;
use Eloquent;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $service_category_id
 * @property string $name
 * @property string|null $description
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read ServiceCategory $category
 * @property-read Collection<int, Service> $services
 * @property-read int|null $services_count
 *
 * @method static ServiceSubCategoryFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereServiceCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ServiceSubCategory whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class ServiceSubCategory extends Model
{
    /** @use HasFactory<ServiceSubCategoryFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'service_category_id',
        'name',
        'description',
        'sort_order',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'service_category_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'service_sub_category_id');
    }
}
