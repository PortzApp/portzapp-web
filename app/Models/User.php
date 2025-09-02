<?php

namespace App\Models;

use App\Enums\OnboardingStatus;
use App\Enums\OnboardingStep;
use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Notifications\VerifyEmail;
use Database\Factories\UserFactory;
use Eloquent;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string $first_name
 * @property string|null $last_name
 * @property string $phone_number
 * @property-read DatabaseNotificationCollection<int, DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read Collection<int, Organization> $organizations
 * @property-read int|null $organizations_count
 * @property-read Collection<int, Service> $services
 * @property-read int|null $services_count
 * @property-read Organization|null $currentOrganization
 *
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereFirstName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePhoneNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUlids, Notifiable;

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
        'current_organization_id',
        'onboarding_status',
        'onboarding_step',
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
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'onboarding_status' => OnboardingStatus::class,
            'onboarding_step' => OnboardingStep::class,
        ];
    }

    public function currentOrganization(): BelongsTo
    {
        return $this->belongsTo(Organization::class, 'current_organization_id');
    }

    /**
     * Get the services for the current user.
     */
    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }

    /**
     * Get the organizations for the current user.
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(Organization::class)
            ->using(OrganizationUser::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    /**
     * Generic method to check if user is in an organization with a specific business type.
     */
    public function isInOrganizationWithBusinessType(OrganizationBusinessType $businessType): bool
    {
        /** @var Organization $current_organization */
        $current_organization = $this->currentOrganization;

        if (! $current_organization) {
            return false;
        }

        return $current_organization->business_type === $businessType;
    }

    public function isInOrganizationWithUserRole(UserRoles $userRole): bool
    {
        $userRoleInOrg = $this->getRoleInCurrentOrganization();

        return $userRoleInOrg === $userRole;
    }

    /**
     * Get the user's role in a specific organization.
     */
    public function getRoleInCurrentOrganization(): ?UserRoles
    {
        /** @var Organization|null $organization */
        $organization = $this->currentOrganization;

        if (! $organization) {
            return null;
        }

        $organization_with_pivot = $this->organizations()
            ->where('organizations.id', $organization->id)
            ->first();

        if (! $organization_with_pivot) {
            return null;
        }

        /** @var object{role: UserRoles} $pivot */
        $pivot = $organization_with_pivot->pivot;

        return $pivot->role;
    }

    /**
     * Get invitations sent by this user.
     */
    public function sentInvitations(): HasMany
    {
        return $this->hasMany(Invitation::class, 'invited_by_user_id');
    }

    /**
     * Get join requests made by this user.
     */
    public function joinRequests(): HasMany
    {
        return $this->hasMany(OrganizationJoinRequest::class);
    }

    /**
     * Get join requests reviewed by this user.
     */
    public function reviewedJoinRequests(): HasMany
    {
        return $this->hasMany(OrganizationJoinRequest::class, 'reviewed_by_user_id');
    }

    /**
     * Send the email verification notification with custom PortzApp branding.
     */
    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmail);
    }
}
