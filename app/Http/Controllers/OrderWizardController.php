<?php

namespace App\Http\Controllers;

use App\Enums\OrderStatus;
use App\Enums\OrganizationBusinessType;
use App\Enums\ServiceStatus;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Vessel;
use App\Models\WizardSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderWizardController extends Controller
{
    /**
     * Start the order wizard - Select port & vessel
     */
    public function start()
    {
        $this->ensureVesselOwner();

        // Get user's vessel owner organizations
        $vesselOwnerOrgs = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->get();

        // Get all vessels from user's vessel owner organizations
        $vessels = Vessel::whereIn('organization_id', $vesselOwnerOrgs->pluck('id'))
            ->with('organization:id,name')
            ->get();

        // Get all ports ordered by name
        $ports = Port::orderBy('name')->get();

        // Check if there's an existing wizard session
        $existingSession = WizardSession::where('user_id', auth()->id())
            ->where('expires_at', '>', now())
            ->first();

        return Inertia::render('orders/wizard/start', [
            'vessels' => $vessels,
            'ports' => $ports,
            'existingSession' => $existingSession ? [
                'id' => $existingSession->id,
                'data' => $existingSession->data,
            ] : null,
        ]);
    }

    /**
     * Store port & vessel selection
     */
    public function storeStart(Request $request)
    {
        $this->ensureVesselOwner();

        $validated = $request->validate([
            'vessel_id' => ['required', 'string', 'exists:vessels,id'],
            'port_id' => ['required', 'string', 'exists:ports,id'],
        ]);

        // Cleanup any existing sessions for this user
        WizardSession::where('user_id', auth()->id())->delete();

        // Create new wizard session
        $session = WizardSession::create([
            'user_id' => auth()->id(),
            'session_token' => 'WIZ-' . strtoupper(uniqid()) . '-' . now()->format('Ymd'),
            'current_step' => 1,
            'data' => [
                'vessel_id' => $validated['vessel_id'],
                'port_id' => $validated['port_id'],
                'selected_categories' => [],
                'selected_services' => [],
            ],
            'expires_at' => now()->addHours(24),
        ]);

        return redirect()->route('orders.wizard.categories');
    }

    /**
     * Show service categories for selected port
     */
    public function categories()
    {
        $session = $this->getValidSession();
        $this->ensureStepCompleted($session, 0);

        $portId = $session->data['port_id'];

        // Get service categories that have active services in the selected port
        $categories = ServiceCategory::whereHas('services', function ($query) use ($portId) {
            $query->where('port_id', $portId)
                ->where('status', ServiceStatus::ACTIVE);
        })->with(['services' => function ($query) use ($portId) {
            $query->where('port_id', $portId)
                ->where('status', ServiceStatus::ACTIVE)
                ->with('organization:id,name');
        }])->get();

        return Inertia::render('orders/wizard/categories', [
            'categories' => $categories,
            'session' => [
                'id' => $session->id,
                'data' => $session->data,
            ],
        ]);
    }

    /**
     * Store selected categories
     */
    public function storeCategories(Request $request)
    {
        $session = $this->getValidSession();
        $this->ensureStepCompleted($session, 0);

        $validated = $request->validate([
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['string', 'exists:service_categories,id'],
        ]);

        $sessionData = $session->data;
        $sessionData['current_step'] = 2;
        $sessionData['selected_categories'] = $validated['category_ids'];

        $session->update(['data' => $sessionData]);

        return redirect()->route('orders.wizard.services', $validated['category_ids'][0]);
    }

    /**
     * Show agencies offering services in this category
     */
    public function services(ServiceCategory $category)
    {
        $session = $this->getValidSession();
        $this->ensureStepCompleted($session, 1);

        $portId = $session->data['port_id'];
        $selectedCategories = $session->data['selected_categories'];

        if (! in_array($category->id, $selectedCategories)) {
            return redirect()->route('orders.wizard.categories')
                ->withErrors(['category' => 'Selected category not found in your selections.']);
        }

        // Get services in this category for the selected port
        $services = Service::where('service_category_id', $category->id)
            ->where('port_id', $portId)
            ->where('status', ServiceStatus::ACTIVE)
            ->with(['organization' => function ($query) {
                $query->where('business_type', OrganizationBusinessType::SHIPPING_AGENCY);
            }])
            ->get()
            ->groupBy('organization.id');

        return Inertia::render('orders/wizard/services', [
            'category' => $category,
            'servicesByAgency' => $services,
            'session' => [
                'id' => $session->id,
                'data' => $session->data,
            ],
            'allCategories' => $selectedCategories,
            'currentCategoryIndex' => array_search($category->id, $selectedCategories),
        ]);
    }

    /**
     * Store selected service/agency
     */
    public function storeService(Request $request, ServiceCategory $category)
    {
        $session = $this->getValidSession();
        $this->ensureStepCompleted($session, 1);

        $validated = $request->validate([
            'service_selections' => ['required', 'array', 'min:1'],
            'service_selections.*.service_id' => ['required', 'string', 'exists:services,id'],
            'service_selections.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $sessionData = $session->data;

        // Initialize selected_services if not exists
        if (! isset($sessionData['selected_services'])) {
            $sessionData['selected_services'] = [];
        }

        // Store selections for this category
        $sessionData['selected_services'][$category->id] = $validated['service_selections'];

        // Check if all categories have been processed
        $selectedCategories = $sessionData['selected_categories'];
        $processedCategories = array_keys($sessionData['selected_services']);

        if (count($selectedCategories) === count($processedCategories)) {
            $sessionData['current_step'] = 3;
        }

        $session->update(['data' => $sessionData]);

        // Find next unprocessed category or go to summary
        $nextCategoryId = null;
        foreach ($selectedCategories as $catId) {
            if (! in_array($catId, $processedCategories)) {
                $nextCategoryId = $catId;
                break;
            }
        }

        if ($nextCategoryId) {
            return redirect()->route('orders.wizard.services', $nextCategoryId);
        } else {
            return redirect()->route('orders.wizard.summary');
        }
    }

    /**
     * Show all selections for review
     */
    public function summary()
    {
        $session = $this->getValidSession();
        $this->ensureStepCompleted($session, 2);

        // Load all the data for display
        $vessel = Vessel::with('organization')->find($session->data['vessel_id']);
        $port = Port::find($session->data['port_id']);

        $selectedServices = [];
        $totalEstimate = 0;

        foreach ($session->data['selected_services'] as $categoryId => $services) {
            $category = ServiceCategory::find($categoryId);
            $categoryServices = [];

            foreach ($services as $serviceSelection) {
                $service = Service::with('organization')->find($serviceSelection['service_id']);
                $quantity = $serviceSelection['quantity'];
                $lineTotal = $service->price * $quantity;
                $totalEstimate += $lineTotal;

                $categoryServices[] = [
                    'service' => $service,
                    'quantity' => $quantity,
                    'unit_price' => $service->price,
                    'line_total' => $lineTotal,
                ];
            }

            $selectedServices[] = [
                'category' => $category,
                'services' => $categoryServices,
            ];
        }

        return Inertia::render('orders/wizard/summary', [
            'vessel' => $vessel,
            'port' => $port,
            'selectedServices' => $selectedServices,
            'totalEstimate' => $totalEstimate,
            'session' => [
                'id' => $session->id,
                'data' => $session->data,
            ],
        ]);
    }

    /**
     * Create order and split into groups
     */
    public function confirm(Request $request)
    {
        $session = $this->getValidSession();
        $this->ensureStepCompleted($session, 2);

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($session, $validated) {
            // Get vessel owner organization
            $vessel = Vessel::find($session->data['vessel_id']);

            // Create the main order
            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(uniqid()),
                'vessel_id' => $session->data['vessel_id'],
                'port_id' => $session->data['port_id'],
                'placed_by_user_id' => auth()->id(),
                'placed_by_organization_id' => $vessel->organization_id,
                'notes' => $validated['notes'] ?? null,
                'status' => OrderStatus::DRAFT,
                'total_amount' => 0, // Will be calculated after creating groups
            ]);

            // Group services by agency organization
            $servicesByAgency = [];
            foreach ($session->data['selected_services'] as $categoryId => $services) {
                foreach ($services as $serviceSelection) {
                    $service = Service::find($serviceSelection['service_id']);
                    $agencyId = $service->organization_id;

                    if (! isset($servicesByAgency[$agencyId])) {
                        $servicesByAgency[$agencyId] = [];
                    }

                    $servicesByAgency[$agencyId][] = [
                        'service_id' => $service->id,
                        'quantity' => $serviceSelection['quantity'],
                        'unit_price' => $service->price,
                        'total_price' => $service->price * $serviceSelection['quantity'],
                    ];
                }
            }

            // Create order groups for each agency
            $totalAmount = 0;
            $groupNumber = 1;

            foreach ($servicesByAgency as $agencyId => $services) {
                $subtotalAmount = array_sum(array_column($services, 'total_price'));
                $totalAmount += $subtotalAmount;

                $orderGroup = OrderGroup::create([
                    'group_number' => $groupNumber++,
                    'order_id' => $order->id,
                    'agency_organization_id' => $agencyId,
                    'status' => \App\Enums\OrderGroupStatus::PENDING,
                    'subtotal_amount' => $subtotalAmount,
                ]);

                // Attach services to the order group via pivot table
                foreach ($services as $serviceData) {
                    DB::table('order_service')->insert([
                        'order_id' => $order->id,
                        'service_id' => $serviceData['service_id'],
                        'order_group_id' => $orderGroup->id,
                        'quantity' => $serviceData['quantity'],
                        'unit_price' => $serviceData['unit_price'],
                        'total_price' => $serviceData['total_price'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Update order total amount
            $order->update(['total_amount' => $totalAmount]);

            // Delete the wizard session
            $session->delete();
        });

        return redirect()->route('orders.index')
            ->with('message', 'Order created successfully and sent to agencies for approval!');
    }

    /**
     * Cancel wizard and cleanup
     */
    public function cancel()
    {
        WizardSession::where('user_id', auth()->id())->delete();

        return redirect()->route('orders.index')
            ->with('message', 'Order wizard cancelled.');
    }

    /**
     * Ensure user is from vessel owner organization
     */
    private function ensureVesselOwner()
    {
        $hasVesselOwnerOrg = auth()->user()->organizations()
            ->where('business_type', OrganizationBusinessType::VESSEL_OWNER)
            ->exists();

        if (! $hasVesselOwnerOrg) {
            abort(403, 'You must belong to a vessel owner organization to create orders.');
        }
    }

    /**
     * Get valid wizard session or abort
     */
    private function getValidSession(): WizardSession
    {
        $session = WizardSession::where('user_id', auth()->id())
            ->where('expires_at', '>', now())
            ->first();

        if (! $session) {
            abort(404, 'No valid wizard session found. Please start a new order.');
        }

        return $session;
    }

    /**
     * Ensure previous steps are completed
     */
    private function ensureStepCompleted(WizardSession $session, int $requiredStep)
    {
        $currentStep = $session->data['current_step'] ?? 0;

        if ($currentStep < $requiredStep) {
            abort(403, 'Previous steps must be completed first.');
        }
    }
}
