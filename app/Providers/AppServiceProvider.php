<?php

namespace App\Providers;

use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderWizardSession;
use App\Models\Port;
use App\Models\Service;
use App\Policies\OrderGroupPolicy;
use App\Policies\OrderPolicy;
use App\Policies\OrderWizardSessionPolicy;
use App\Policies\PortPolicy;
use App\Policies\ServicePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
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
    }
}
