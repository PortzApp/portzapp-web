<?php

namespace App\Http\Controllers;

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Enums\WizardStep;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderWizardSession;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\ServiceSubCategory;
use App\Models\Vessel;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderWizardSessionController extends Controller
{
    /**
     * Display a listing of the user's wizard sessions.
     */
    public function index()
    {
        Gate::authorize('view-any', OrderWizardSession::class);

        $user = auth()->user();
        $sessions = OrderWizardSession::where('user_id', $user->id)
            ->where('organization_id', $user->current_organization_id)
            ->active()
            ->with(['vessel', 'port'])
            ->latest()
            ->get();

        return back()->with([
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a newly created wizard session.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', OrderWizardSession::class);

        $validated = $request->validate([
            'session_name' => 'nullable|string|max:255',
        ]);

        $user = auth()->user();
        $sessionName = $validated['session_name'] ?? 'Order Draft - '.now()->format('M j, Y g:i A');

        $session = OrderWizardSession::create([
            'user_id' => $user->id,
            'organization_id' => $user->current_organization_id,
            'session_name' => $sessionName,
            'current_step' => WizardStep::VESSEL_PORT,
            'status' => 'draft',
            'expires_at' => now()->addDays(30),
        ]);

        return to_route('order-wizard.flow', ['session' => $session->id]);
    }

    /**
     * Display the specified wizard session.
     */
    public function show(OrderWizardSession $session)
    {
        Gate::authorize('view', $session);

        $session->load(['user', 'organization', 'vessel', 'port']);

        return back()->with([
            'session' => $session,
        ]);
    }

    /**
     * Update the specified wizard session.
     */
    public function update(Request $request, OrderWizardSession $session)
    {
        //        Gate::authorize('update', $session);

        $validator = Validator::make($request->all(), [
            'vessel_id' => 'nullable|exists:vessels,id',
            'port_id' => 'nullable|exists:ports,id',
            'selected_categories' => 'nullable|array',
            'selected_categories.*' => 'exists:service_categories,id',
            'selected_services' => 'nullable|array',
            'current_step' => ['required', 'string', Rule::enum(WizardStep::class)],
            'session_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $validated = $validator->validated();

        // Only update the fields that were provided
        $updateData = array_filter($validated, function ($value, $key) {
            return $value !== null || in_array($key, ['current_step']);
        }, ARRAY_FILTER_USE_BOTH);

        $session->update($updateData);

        // Refresh the session and load relationships
        $session->refresh();
        $session->load(['vessel', 'port', 'categorySelections.serviceCategory', 'serviceSelections.service']);

        return back()->with([
            'session' => $session,
        ]);
    }

    /**
     * Set vessel and port for the session.
     */
    public function setVesselAndPort(Request $request, OrderWizardSession $session)
    {
        //        Gate::authorize('update', $session);

        $validated = $request->validate([
            'vessel_id' => 'required|exists:vessels,id',
            'port_id' => 'required|exists:ports,id',
        ]);

        $session->update([
            'vessel_id' => $validated['vessel_id'],
            'port_id' => $validated['port_id'],
            'current_step' => WizardStep::CATEGORIES,
        ]);

        $session->load(['vessel', 'port', 'categorySelections.serviceCategory', 'serviceSelections.service']);

        return back()->with([
            'session' => $session,
        ]);
    }

    /**
     * Set selected categories for the session.
     */
    public function setCategories(Request $request, OrderWizardSession $session)
    {
        //        Gate::authorize('update', $session);

        $validated = $request->validate([
            'selected_sub_categories' => 'required|array|min:1',
            'selected_sub_categories.*' => 'exists:service_sub_categories,id',
        ]);

        // Clear existing category selections
        $session->categorySelections()->delete();

        // Get the parent categories from the selected sub-categories
        $subCategories = ServiceSubCategory::whereIn('id', $validated['selected_sub_categories'])
            ->with('category')
            ->get();

        $uniqueCategories = $subCategories->pluck('category')->unique('id');

        // Create category selections for the unique parent categories
        foreach ($uniqueCategories as $index => $category) {
            $session->categorySelections()->create([
                'service_category_id' => $category->id,
                'order_index' => $index,
            ]);
        }

        $session->update([
            'current_step' => WizardStep::SERVICES,
        ]);

        $session->load(['vessel', 'port', 'categorySelections.serviceCategory']);

        return back()->with([
            'session' => $session,
        ]);
    }

    /**
     * Set selected services for the session.
     */
    public function setServices(Request $request, OrderWizardSession $session)
    {
        //        Gate::authorize('update', $session);

        $validated = $request->validate([
            'selected_services' => 'required|array|min:1',
            'selected_services.*' => 'exists:services,id',
        ]);

        // Clear existing service selections
        $session->serviceSelections()->delete();

        // Get the actual service objects with their details
        $services = Service::whereIn('id', $validated['selected_services'])
            ->with(['organization', 'subCategory.category'])
            ->get();

        // Create new service selections
        foreach ($services as $service) {
            $session->serviceSelections()->create([
                'service_category_id' => $service->category->id,
                'service_id' => $service->id,
                'organization_id' => $service->organization_id,
                'price_snapshot' => $service->price,
                'notes' => null,
            ]);
        }

        $session->update([
            'current_step' => WizardStep::REVIEW,
        ]);

        $session->load(['vessel', 'port', 'categorySelections.serviceCategory', 'serviceSelections.service']);

        return back()->with([
            'session' => $session,
        ]);
    }

    /**
     * Remove the specified wizard session.
     */
    public function destroy(OrderWizardSession $orderWizardSession)
    {
        // Gate::authorize('delete', $orderWizardSession);

        \Log::emergency('🚨 DESTROY METHOD CALLED - Session ID: '.$orderWizardSession->id);
        \Log::info('Attempting to delete session: '.$orderWizardSession->id);

        $result = $orderWizardSession->delete();

        \Log::info('Delete result: '.($result ? 'true' : 'false'));

        // Get updated sessions list for the dashboard
        $user = auth()->user();
        $sessions = OrderWizardSession::where('user_id', $user->id)
            ->where('organization_id', $user->current_organization_id)
            ->active()
            ->with(['vessel', 'port', 'categorySelections.serviceCategory', 'serviceSelections.service'])
            ->latest()
            ->get();

        \Log::info('Remaining sessions after delete: '.$sessions->count());

        return back()->with([
            'sessions' => $sessions,
            'message' => 'Session deleted successfully.',
        ]);
    }

    /**
     * Complete the wizard session and create the actual order.
     */
    public function complete(Request $request, OrderWizardSession $session)
    {
        Gate::authorize('update', $session);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // Validate that the session has all required data
        $serviceSelections = $session->serviceSelections()->count();
        if (! $session->vessel_id || ! $session->port_id || $serviceSelections === 0) {
            return back()->withErrors([
                'error' => 'Session is incomplete. Please ensure vessel, port, and services are selected.',
            ]);
        }

        try {
            DB::beginTransaction();

            // Create the order
            $order = Order::create([
                'order_number' => 'ORD-'.strtoupper(uniqid()),
                'vessel_id' => $session->vessel_id,
                'port_id' => $session->port_id,
                'placed_by_user_id' => $session->user_id,
                'placed_by_organization_id' => $session->organization_id,
                'notes' => $validated['notes'] ?? null,
                'status' => OrderStatus::PENDING_AGENCY_CONFIRMATION,
            ]);

            // Group services by organization and create order groups
            $serviceSelections = $session->serviceSelections()->with(['service.organization'])->get();
            $servicesByOrg = $serviceSelections->groupBy('organization_id');

            foreach ($servicesByOrg as $orgId => $selections) {
                $orderGroup = OrderGroup::create([
                    'group_number' => 'GRP-'.strtoupper(uniqid()),
                    'order_id' => $order->id,
                    'fulfilling_organization_id' => $orgId,
                    'status' => OrderGroupStatus::PENDING,
                    'notes' => null,
                ]);

                // Attach services to this order group
                $serviceIds = $selections->pluck('service_id');
                $orderGroup->services()->attach($serviceIds);
            }

            // Mark session as completed
            $session->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            DB::commit();

            return back()->with([
                'order' => $order->load(['vessel', 'port', 'orderGroups.services']),
                'message' => 'Order created successfully!',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->withErrors([
                'error' => 'Failed to create order. Please try again.',
            ]);
        }
    }

    /**
     * Get wizard data for the dashboard.
     */
    public function dashboard(): Response
    {
        Gate::authorize('viewAny', OrderWizardSession::class);

        $user = auth()->user();
        $sessions = OrderWizardSession::where('user_id', $user->id)
            ->where('organization_id', $user->current_organization_id)
            ->active()
            ->with(['vessel', 'port'])
            ->latest()
            ->get();

        return Inertia::render('orders/wizard/order-wizard-dashboard', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Show vessel and port selection step.
     */
    public function showVesselPortStep(OrderWizardSession $session): Response
    {
        Gate::authorize('view', $session);

        // Update session's current step
        if ($session->current_step !== WizardStep::VESSEL_PORT) {
            $session->update(['current_step' => WizardStep::VESSEL_PORT]);
        }

        $user = auth()->user();

        // Get vessels for the user's current organization
        $vessels = Vessel::where('organization_id', $user->current_organization_id)->get();

        // Get all ports
        $ports = Port::orderBy('name')->get();

        return Inertia::render('orders/wizard/order-wizard-step-vessel-port', [
            'session' => $session->load(['vessel', 'port']),
            'vessels' => $vessels,
            'ports' => $ports,
        ]);
    }

    /**
     * Show categories selection step.
     */
    public function showCategoriesStep(OrderWizardSession $session): Response|RedirectResponse
    {
        Gate::authorize('view', $session);

        // Validate that vessel and port are selected
        if (! $session->vessel_id || ! $session->port_id) {
            return to_route('order-wizard.step', [
                'session' => $session->id,
                'step' => 'vessel_port',
            ])->withErrors(['error' => 'Please select a vessel and port first.']);
        }

        // Update session's current step
        if ($session->current_step !== WizardStep::CATEGORIES) {
            $session->update(['current_step' => WizardStep::CATEGORIES]);
        }

        // Get service categories with their sub-categories
        $serviceCategories = ServiceCategory::with(['subCategories' => function ($query): void {
            $query->orderBy('sort_order')->orderBy('name');
        }])->orderBy('name')->get();

        return Inertia::render('orders/wizard/order-wizard-step-categories', [
            'session' => $session->load(['vessel', 'port', 'categorySelections.serviceCategory']),
            'serviceCategories' => $serviceCategories,
        ]);
    }

    /**
     * Show services selection step.
     */
    public function showServicesStep(OrderWizardSession $session): Response|RedirectResponse
    {
        Gate::authorize('view', $session);

        // Validate that vessel, port, and categories are selected
        if (! $session->vessel_id || ! $session->port_id) {
            return to_route('order-wizard.step', [
                'session' => $session->id,
                'step' => 'vessel_port',
            ])->withErrors(['error' => 'Please select a vessel and port first.']);
        }

        $selectedCategoryIds = $session->categorySelections()->pluck('service_category_id')->toArray();
        if (empty($selectedCategoryIds)) {
            return to_route('order-wizard.step', [
                'session' => $session->id,
                'step' => 'categories',
            ])->withErrors(['error' => 'Please select service categories first.']);
        }

        // Update session's current step
        if ($session->current_step !== WizardStep::SERVICES) {
            $session->update(['current_step' => WizardStep::SERVICES]);
        }

        // Filter services by BOTH port AND selected categories
        $filteredServices = Service::with(['organization', 'subCategory.category'])
            ->where('status', 'active')
            ->where('port_id', $session->port_id)  // Filter by selected port
            ->whereHas('subCategory', function ($query) use ($selectedCategoryIds): void {
                $query->whereIn('service_category_id', $selectedCategoryIds);
            })  // Filter by selected categories
            ->orderBy('organization_id')  // Group by organization
            ->orderBy('name')
            ->get();

        // Debug logging
        \Log::info('🔍 DEBUG Services Step:', [
            'session_id' => $session->id,
            'port_id' => $session->port_id,
            'selected_category_ids' => $selectedCategoryIds,
            'filtered_services_count' => $filteredServices->count(),
            'filtered_services' => $filteredServices->take(5)->map(fn ($s) => [
                'id' => $s->id,
                'name' => $s->name,
                'sub_category_id' => $s->service_sub_category_id,
                'category_id' => $s->subCategory?->service_category_id,
                'port_id' => $s->port_id,
                'org_name' => $s->organization->name ?? 'N/A',
            ])->toArray(),
        ]);

        return Inertia::render('orders/wizard/order-wizard-step-services', [
            'session' => $session->load(['vessel', 'port', 'categorySelections.serviceCategory', 'serviceSelections.service']),
            'services' => $filteredServices,
        ]);
    }

    /**
     * Show review step.
     */
    public function showReviewStep(OrderWizardSession $session): Response|RedirectResponse
    {
        Gate::authorize('view', $session);

        // Validate that all required data is present
        if (! $session->vessel_id || ! $session->port_id) {
            return to_route('order-wizard.step', [
                'session' => $session->id,
                'step' => 'vessel_port',
            ])->withErrors(['error' => 'Please complete all previous steps.']);
        }

        $categoryCount = $session->categorySelections()->count();
        if ($categoryCount === 0) {
            return to_route('order-wizard.step', [
                'session' => $session->id,
                'step' => 'categories',
            ])->withErrors(['error' => 'Please select service categories.']);
        }

        $serviceCount = $session->serviceSelections()->count();
        if ($serviceCount === 0) {
            return to_route('order-wizard.step', [
                'session' => $session->id,
                'step' => 'services',
            ])->withErrors(['error' => 'Please select services.']);
        }

        // Update session's current step
        if ($session->current_step !== WizardStep::REVIEW) {
            $session->update(['current_step' => WizardStep::REVIEW]);
        }

        return Inertia::render('orders/wizard/order-wizard-step-review', [
            'session' => $session->load([
                'vessel',
                'port',
                'categorySelections.serviceCategory',
                'serviceSelections.service.category',
                'serviceSelections.service.organization',
            ]),
        ]);
    }

    /**
     * Get wizard flow data.
     */
    public function flow(?OrderWizardSession $session = null): Response
    {
        if ($session) {
            Gate::authorize('view', $session);
        } else {
            Gate::authorize('create', OrderWizardSession::class);
        }

        $user = auth()->user();

        // Get vessels for the user's current organization
        $vessels = Vessel::where('organization_id', $user->current_organization_id)->get();

        // Get all ports
        $ports = Port::orderBy('name')->get();

        // Get service categories
        $serviceCategories = ServiceCategory::orderBy('name')->get();

        // Get all services with their organization and category relationships
        $services = Service::with(['organization', 'subCategory.category'])
            ->where('status', 'active')
            ->orderBy('name')
            ->get();

        return Inertia::render('orders/wizard/order-wizard-flow', [
            'session' => $session ? $session->load([
                'vessel',
                'port',
                'categorySelections.serviceCategory',
                'serviceSelections.service.category',
                'serviceSelections.service.organization',
            ]) : null,
            'vessels' => $vessels,
            'ports' => $ports,
            'serviceCategories' => $serviceCategories,
            'services' => $services,
        ]);
    }
}
