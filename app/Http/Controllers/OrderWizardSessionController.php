<?php

namespace App\Http\Controllers;

use App\Enums\OrderGroupStatus;
use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderWizardSession;
use App\Models\Port;
use App\Models\Service;
use App\Models\ServiceCategory;
use App\Models\Vessel;
use Illuminate\Http\JsonResponse;
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
    public function index(): JsonResponse
    {
        Gate::authorize('viewAny', OrderWizardSession::class);

        $user = auth()->user();
        $sessions = OrderWizardSession::where('user_id', $user->id)
            ->where('organization_id', $user->current_organization_id)
            ->active()
            ->with(['vessel', 'port'])
            ->latest()
            ->get();

        return response()->json([
            'sessions' => $sessions,
        ]);
    }

    /**
     * Store a newly created wizard session.
     */
    public function store(Request $request): JsonResponse
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
            'current_step' => 'vessel_port',
            'status' => 'draft',
            'expires_at' => now()->addDays(30),
        ]);

        return response()->json([
            'session' => $session->load(['vessel', 'port']),
        ], 201);
    }

    /**
     * Display the specified wizard session.
     */
    public function show(OrderWizardSession $session): JsonResponse
    {
        Gate::authorize('view', $session);

        $session->load(['user', 'organization', 'vessel', 'port']);

        return response()->json([
            'session' => $session,
        ]);
    }

    /**
     * Update the specified wizard session.
     */
    public function update(Request $request, OrderWizardSession $session): JsonResponse
    {
        Gate::authorize('update', $session);

        $validator = Validator::make($request->all(), [
            'vessel_id' => 'nullable|exists:vessels,id',
            'port_id' => 'nullable|exists:ports,id',
            'selected_categories' => 'nullable|array',
            'selected_categories.*' => 'exists:service_categories,id',
            'selected_services' => 'nullable|array',
            'current_step' => ['required', 'string', Rule::in(['vessel_port', 'categories', 'services', 'review'])],
            'session_name' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        // Only update the fields that were provided
        $updateData = array_filter($validated, function ($value, $key) {
            return $value !== null || in_array($key, ['current_step']);
        }, ARRAY_FILTER_USE_BOTH);

        $session->update($updateData);

        return response()->json([
            'session' => $session->fresh()->load(['vessel', 'port']),
        ]);
    }

    /**
     * Remove the specified wizard session.
     */
    public function destroy(OrderWizardSession $session): JsonResponse
    {
        Gate::authorize('delete', $session);

        $session->delete();

        return response()->json([
            'message' => 'Session deleted successfully.',
        ]);
    }

    /**
     * Complete the wizard session and create the actual order.
     */
    public function complete(Request $request, OrderWizardSession $session): JsonResponse
    {
        Gate::authorize('update', $session);

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        // Validate that the session has all required data
        if (! $session->vessel_id || ! $session->port_id || empty($session->selected_services)) {
            return response()->json([
                'error' => 'Session is incomplete. Please ensure vessel, port, and services are selected.',
            ], 422);
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
            $serviceIds = collect($session->selected_services)->pluck('id');
            $services = Service::whereIn('id', $serviceIds)->with('organization')->get();
            $servicesByOrg = $services->groupBy('organization_id');

            foreach ($servicesByOrg as $orgId => $orgServices) {
                $orderGroup = OrderGroup::create([
                    'group_number' => 'GRP-'.strtoupper(uniqid()),
                    'order_id' => $order->id,
                    'fulfilling_organization_id' => $orgId,
                    'status' => OrderGroupStatus::PENDING,
                    'notes' => null,
                ]);

                // Attach services to this order group
                $orderGroup->services()->attach($orgServices->pluck('id'));
            }

            // Mark session as completed
            $session->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'order' => $order->load(['vessel', 'port', 'orderGroups.services']),
                'message' => 'Order created successfully!',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'error' => 'Failed to create order. Please try again.',
            ], 500);
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

        return Inertia::render('orders/wizard/order-wizard-flow', [
            'session' => $session ? $session->load(['vessel', 'port']) : null,
            'vessels' => $vessels,
            'ports' => $ports,
            'serviceCategories' => $serviceCategories,
        ]);
    }
}
