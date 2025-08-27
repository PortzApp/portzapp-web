<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\OrganizationBusinessType;
use App\Models\Order;
use App\Models\Organization;
use App\Models\Port;
use App\Models\Service;
use App\Models\User;
use App\Models\Vessel;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $currentOrg = $user->currentOrganization;

        if (! $currentOrg) {
            return Inertia::render('dashboard', [
                'dashboardData' => null,
                'organizationType' => null,
            ]);
        }

        $dashboardData = match ($currentOrg->business_type) {
            OrganizationBusinessType::VESSEL_OWNER => $this->getVesselOwnerData($user, $currentOrg),
            OrganizationBusinessType::SHIPPING_AGENCY => $this->getShippingAgencyData($user, $currentOrg),
            OrganizationBusinessType::PORTZAPP_TEAM => $this->getPortzAppTeamData($user),
        };

        return Inertia::render('dashboard', [
            'dashboardData' => $dashboardData,
            'organizationType' => $currentOrg->business_type->value,
        ]);
    }

    private function getVesselOwnerData(User $user, Organization $organization): array
    {
        $totalVessels = Vessel::where('organization_id', $organization->id)->count();
        $totalOrders = Order::where('placed_by_organization_id', $organization->id)->count();
        $pendingOrders = Order::where('placed_by_organization_id', $organization->id)
            ->where('status', OrderStatus::PENDING_AGENCY_CONFIRMATION)
            ->count();
        $activeOrders = Order::where('placed_by_organization_id', $organization->id)
            ->whereIn('status', [OrderStatus::CONFIRMED, OrderStatus::PARTIALLY_ACCEPTED])
            ->count();

        // Recent orders
        $recentOrders = Order::where('placed_by_organization_id', $organization->id)
            ->with(['vessel', 'port', 'orderGroups.fulfillingOrganization'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order): array {
                /** @var Order $order */
                return [
                    'id' => $order->id,
                    'vessel_name' => $order->vessel->name,
                    'port_name' => $order->port->name,
                    'status' => $order->status->value,
                    'total_price' => $order->total_price,
                    'created_at' => $order->created_at->diffForHumans(),
                ];
            });

        // Order trends (last 6 months)
        $orderTrends = Order::where('placed_by_organization_id', $organization->id)
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get()
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m');
            })
            ->map(function ($orders, $month) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $month)->format('M Y'),
                    'orders' => $orders->count(),
                ];
            })
            ->sortBy(function ($item) {
                return Carbon::createFromFormat('M Y', $item['month']);
            })
            ->values();

        return [
            'kpis' => [
                ['label' => 'Total Vessels', 'value' => $totalVessels, 'icon' => 'Ship'],
                ['label' => 'Total Orders', 'value' => $totalOrders, 'icon' => 'Package'],
                ['label' => 'Pending Orders', 'value' => $pendingOrders, 'icon' => 'Clock'],
                ['label' => 'Active Orders', 'value' => $activeOrders, 'icon' => 'CheckCircle'],
            ],
            'recentOrders' => $recentOrders,
            'orderTrends' => $orderTrends,
        ];
    }

    private function getShippingAgencyData(User $user, Organization $organization): array
    {
        $activeServices = Service::where('organization_id', $organization->id)
            ->where('status', 'active')
            ->count();

        $pendingOrders = Order::whereHas('orderGroups', function ($query) use ($organization): void {
            $query->where('fulfilling_organization_id', $organization->id)
                ->where('status', 'pending');
        })->count();

        $completedOrdersThisMonth = Order::whereHas('orderGroups', function ($query) use ($organization): void {
            $query->where('fulfilling_organization_id', $organization->id)
                ->where('status', 'completed');
        })
            ->whereMonth('created_at', Carbon::now()->month)
            ->count();

        $monthlyRevenue = Order::whereHas('orderGroups', function ($query) use ($organization): void {
            $query->where('fulfilling_organization_id', $organization->id)
                ->where('status', 'completed');
        })
            ->whereMonth('created_at', Carbon::now()->month)
            ->get()
            ->sum('total_price');

        // Recent order requests
        $recentOrderRequests = Order::whereHas('orderGroups', function ($query) use ($organization): void {
            $query->where('fulfilling_organization_id', $organization->id);
        })
            ->with(['vessel', 'port', 'placedByOrganization'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($order): array {
                /** @var Order $order */
                return [
                    'id' => $order->id,
                    'vessel_name' => $order->vessel->name,
                    'port_name' => $order->port->name,
                    'client_name' => $order->placedByOrganization->name,
                    'status' => $order->aggregated_status->value,
                    'total_price' => $order->total_price,
                    'created_at' => $order->created_at->diffForHumans(),
                ];
            });

        // Revenue trends (last 6 months)
        $revenueTrends = Order::whereHas('orderGroups', function ($query) use ($organization): void {
            $query->where('fulfilling_organization_id', $organization->id)
                ->where('status', 'completed');
        })
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get()
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m');
            })
            ->map(function ($orders, $month) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $month)->format('M Y'),
                    'revenue' => $orders->sum('total_price'),
                ];
            })
            ->sortBy(function ($item) {
                return Carbon::createFromFormat('M Y', $item['month']);
            })
            ->values();

        return [
            'kpis' => [
                ['label' => 'Active Services', 'value' => $activeServices, 'icon' => 'Settings'],
                ['label' => 'Pending Orders', 'value' => $pendingOrders, 'icon' => 'Clock'],
                ['label' => 'Completed This Month', 'value' => $completedOrdersThisMonth, 'icon' => 'CheckCircle'],
                ['label' => 'Monthly Revenue', 'value' => '$'.number_format($monthlyRevenue, 0), 'icon' => 'DollarSign'],
            ],
            'recentOrderRequests' => $recentOrderRequests,
            'revenueTrends' => $revenueTrends,
        ];
    }

    private function getPortzAppTeamData(User $user): array
    {
        $totalOrganizations = Organization::count();
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $activePorts = Port::count(); // Assuming we have a ports table

        // System activity (orders per month)
        $systemActivity = Order::where('created_at', '>=', Carbon::now()->subMonths(6))
            ->get()
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m');
            })
            ->map(function ($orders, $month) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $month)->format('M Y'),
                    'orders' => $orders->count(),
                ];
            })
            ->sortBy(function ($item) {
                return Carbon::createFromFormat('M Y', $item['month']);
            })
            ->values();

        // Organization distribution
        $orgDistribution = Organization::all()
            ->groupBy('business_type')
            ->map(function ($orgs, $businessType) {
                return [
                    'type' => OrganizationBusinessType::from($businessType)->label(),
                    'count' => $orgs->count(),
                ];
            })
            ->values();

        return [
            'kpis' => [
                ['label' => 'Total Organizations', 'value' => $totalOrganizations, 'icon' => 'Building'],
                ['label' => 'Total Users', 'value' => $totalUsers, 'icon' => 'Users'],
                ['label' => 'Total Orders', 'value' => $totalOrders, 'icon' => 'Package'],
                ['label' => 'Active Ports', 'value' => $activePorts, 'icon' => 'Anchor'],
            ],
            'systemActivity' => $systemActivity,
            'orgDistribution' => $orgDistribution,
        ];
    }
}
