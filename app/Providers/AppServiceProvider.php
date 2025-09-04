<?php

namespace App\Providers;

use App\Models\Invitation;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderGroupService;
use App\Models\OrderWizardSession;
use App\Models\OrganizationJoinRequest;
use App\Models\Port;
use App\Models\Service;
use App\Models\User;
use App\Observers\OrderGroupObserver;
use App\Observers\OrderGroupServiceObserver;
use App\Observers\OrderObserver;
use App\Policies\InvitationPolicy;
use App\Policies\OrderGroupPolicy;
use App\Policies\OrderPolicy;
use App\Policies\OrderWizardSessionPolicy;
use App\Policies\OrganizationJoinRequestPolicy;
use App\Policies\PortPolicy;
use App\Policies\ServicePolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(Order::class, OrderPolicy::class);
        Gate::policy(OrderGroup::class, OrderGroupPolicy::class);
        Gate::policy(OrderWizardSession::class, OrderWizardSessionPolicy::class);
        Gate::policy(Port::class, PortPolicy::class);
        Gate::policy(\App\Models\Organization::class, \App\Policies\OrganizationPolicy::class);
        Gate::policy(OrganizationJoinRequest::class, OrganizationJoinRequestPolicy::class);
        Gate::policy(Invitation::class, InvitationPolicy::class);
        Gate::policy(User::class, UserPolicy::class);

        // Register model observers
        Order::observe(OrderObserver::class);
        OrderGroup::observe(OrderGroupObserver::class);
        OrderGroupService::observe(OrderGroupServiceObserver::class);
    }
}
