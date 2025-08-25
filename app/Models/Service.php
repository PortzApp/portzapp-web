<?php

namespace App\Models;

use App\Enums\ServiceStatus;
use Eloquent;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOneThrough;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $organization_id
 * @property string $port_id
 * @property string|null $description
 * @property string $price
 * @property string $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $service_sub_category_id
 * @property-read ServiceSubCategory|null $subCategory
 * @property-read ServiceCategory|null $category
 * @property-read Organization $organization
 * @property-read Port $port
 *
 * @method static isActive()
 * @method static \Database\Factories\ServiceFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereOrganizationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service wherePortId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereServiceCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Service whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class Service extends Model
{
    use HasFactory, HasUlids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'description',
        'price',
        'status',
        'organization_id',
        'port_id',
        'service_sub_category_id',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        // 'category', // Temporarily removed due to PHPStan issues
    ];

    /**
     * Get the organization that created the service.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the port assigned to the service.
     */
    public function port(): BelongsTo
    {
        return $this->belongsTo(Port::class);
    }

    /**
     * Get the service sub-category relationship.
     */
    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(ServiceSubCategory::class, 'service_sub_category_id');
    }

    /**
     * Get the parent category through the sub-category.
     */
    public function category(): HasOneThrough
    {
        return $this->hasOneThrough(
            ServiceCategory::class,    // Final model
            ServiceSubCategory::class, // Intermediate model
            'id',                      // Foreign key on intermediate table pointing to this table (sub_categories.id)
            'id',                      // Foreign key on final table (categories.id)
            'service_sub_category_id', // Local key on this table (services.service_sub_category_id)
            'service_category_id'      // Local key on intermediate table pointing to final table (sub_categories.service_category_id)
        );
    }

    /**
     * Get the orders for the current service.
     * Note: This relationship is deprecated. Use orderGroups() or orderGroupServices() instead.
     */
    // public function orders(): BelongsToMany
    // {
    //     return $this->belongsToMany(Order::class, 'order_service')
    //         ->as('orderService')
    //         ->withTimestamps();
    // }

    /**
     * Get the order groups for the current service through OrderGroupService.
     */
    public function orderGroups(): BelongsToMany
    {
        return $this->belongsToMany(OrderGroup::class, 'order_group_services')
            ->withPivot(['status', 'notes', 'price_snapshot'])
            ->withTimestamps();
    }

    /**
     * Get the OrderGroupService records for this service.
     */
    public function orderGroupServices(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(OrderGroupService::class);
    }

    /**
     * Scope a query to only include active services.
     */
    #[Scope]
    protected function isActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope a query to include services in a specific category.
     */
    public function scopeInCategory(Builder $query, string $categoryId): Builder
    {
        return $query->whereHas('subCategory', fn ($q) => $q->where('service_category_id', $categoryId));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => ServiceStatus::class,
        ];
    }
}
