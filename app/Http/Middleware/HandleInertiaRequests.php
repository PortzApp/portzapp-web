<?php

namespace App\Http\Middleware;

use App\Models\Organization;
use App\Models\Service;
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
            /** @var iterable<Organization> $all_organizations */
            $all_organizations = $user->organizations()->withPivot('role')->get();

            /** @var Organization $current_organization */
            $current_organization = $user->currentOrganization;
            $current_organization_role = $user->current_organization_id
                ? $user->getRoleInOrganization($user->current_organization_id)
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
                'current_organization' => [
                    'id' => $current_organization->id,
                    'name' => $current_organization->name,
                    'business_type' => $current_organization->business_type,
                    'registration_code' => $current_organization->registration_code,
                    'role' => $current_organization_role,
                    'created_at' => $current_organization->created_at,
                    'updated_at' => $current_organization->updated_at,
                ],
                /** @phpstan-ignore method.nonObject */
                'organizations' => $all_organizations->map(function (Organization $org) {
                    /** @phpstan-ignore property.notFound */
                    $role_in_org = $org->pivot->role;

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
                'can' => fn() => $user ? [
                    'create_services' => $user->can('create', Service::class),
                ] : null,
            ],
            'ziggy' => fn(): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
