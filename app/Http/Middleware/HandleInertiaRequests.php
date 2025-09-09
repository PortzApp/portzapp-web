<?php

namespace App\Http\Middleware;

use App\Enums\UserRoles;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Vessel;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $userAuth = null;
        $all_organizations = null;
        $userRole = null;

        if ($user) {
            /** @var Collection<int, Organization> $all_organizations */
            $all_organizations = $user->organizations()->withPivot('role')->get();

            /** @var Organization $current_organization */
            $current_organization = $user->currentOrganization;
            $current_organization_role = $user->current_organization_id
                ? $user->getRoleInCurrentOrganization()
                : null;

            $userAuth = [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
                'current_organization' => $current_organization ? [
                    'id' => $current_organization->id,
                    'name' => $current_organization->name,
                    'business_type' => $current_organization->business_type,
                    'registration_code' => $current_organization->registration_code,
                    'role' => $current_organization_role,
                    'created_at' => $current_organization->created_at,
                    'updated_at' => $current_organization->updated_at,
                ] : null,
                'organizations' => $all_organizations->map(function (Organization $org) {
                    /** @var object{role: UserRoles} $pivot */
                    /** @phpstan-ignore-next-line property.notFound */
                    $pivot = $org->pivot;
                    $role_in_org = $pivot->role;

                    return [
                        'id' => $org->id,
                        'name' => $org->name,
                        'business_type' => $org->business_type,
                        'registration_code' => $org->registration_code,
                        'role' => $role_in_org,
                        'created_at' => $org->created_at,
                        'updated_at' => $org->updated_at,
                    ];
                }),
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $userAuth,
                'permissions' => fn () => $user ? [
                    'organization' => [
                        'view_any' => $user->can('viewAny', Organization::class),
                        'view' => $user->can('viewAny', Organization::class),
                        'create' => $user->can('create', Organization::class),
                        'edit' => $user->can('create', Organization::class),
                        'delete' => $user->can('create', Organization::class),
                        'update_current' => $user->can('updateCurrent', Organization::class),
                        'updateMemberRole' => $user->can('updateMemberRole', Organization::class),
                    ],
                    'service' => [
                        'view_any' => $user->can('viewAny', Service::class),
                        'view' => $user->can('viewAny', Service::class), // For generic view permission
                        'create' => $user->can('create', Service::class),
                        'edit' => $user->can('create', Service::class), // For generic edit permission, use create check
                        'delete' => $user->can('create', Service::class), // For generic delete permission, use create check
                    ],
                    'serviceCategory' => [
                        'view' => $user->can('viewAny', ServiceCategory::class),
                        'create' => $user->can('create', ServiceCategory::class),
                        'update' => $user->can('create', ServiceCategory::class),
                        'delete' => $user->can('create', ServiceCategory::class),
                    ],
                    'order' => [
                        'view_any' => $user->can('viewAny', Order::class),
                        'view' => $user->can('viewAny', Order::class),
                        'create' => $user->can('create', Order::class),
                        'edit' => $user->can('create', Order::class),
                        'delete' => $user->can('create', Order::class),
                    ],
                    'order_group' => [
                        'view_any' => $user->can('viewAny', OrderGroup::class),
                        'view' => $user->can('viewAny', OrderGroup::class),
                        'create' => $user->can('create', OrderGroup::class),
                        'edit' => $user->can('create', OrderGroup::class),
                        'delete' => $user->can('create', OrderGroup::class),
                    ],
                    'vessel' => [
                        'view_any' => $user->can('viewAny', Vessel::class),
                        'view' => $user->can('viewAny', Vessel::class),
                        'create' => $user->can('create', Vessel::class),
                        'edit' => $user->can('create', Vessel::class),
                        'delete' => $user->can('create', Vessel::class),
                    ],
                    'port' => [
                        'view_any' => $user->can('viewAny', Port::class),
                        'view' => $user->can('viewAny', Port::class),
                        'create' => $user->can('create', Port::class),
                        'edit' => $user->can('create', Port::class),
                        'delete' => $user->can('create', Port::class),
                    ],
                ] : null,
            ],
            'flash' => [
                'data' => fn () => $request->session()->get('data'),
                'message' => fn () => $request->session()->get('message'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
