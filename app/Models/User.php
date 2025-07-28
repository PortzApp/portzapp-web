<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'password',
    ];
    
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the services for the current user.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get the vessels for the current user.
     */
    public function vessels(): HasMany
    {
        return $this->hasMany(Vessel::class);
    }

    /**
     * Get the organizations for the current user.
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)->withPivot('role')->withTimestamps();
    }

    /**
     * Check if the user has a specific role in any organization.
     */
    public function hasRoleInOrganization(string $role, ?int $organizationId = null): bool
    {
        $query = $this->organizations()->wherePivot('role', $role);
        
        if ($organizationId) {
            $query->where('organizations.id', $organizationId);
        }
        
        return $query->exists();
    }

    /**
     * Get the user's role in a specific organization.
     */
    public function getRoleInOrganization(int $organizationId): ?string
    {
        $organization = $this->organizations()->where('organizations.id', $organizationId)->first();
        
        return $organization?->pivot->role;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
