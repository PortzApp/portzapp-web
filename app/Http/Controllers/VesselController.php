<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVesselRequest;
use App\Http\Requests\UpdateVesselRequest;
use App\Models\Vessel;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class VesselController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('view-any', Vessel::class);

        return Inertia::render('vessels/vessels-index-page', [
            'vessels' => Vessel::query()
                ->where('organization_id', auth()->user()->current_organization_id)
                ->latest()
                ->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVesselRequest $request)
    {
        Gate::authorize('create', Vessel::class);

        $validated = $request->validated();

        // Convert units for storage (frontend sends user-friendly units, we store in base SI units)
        $vesselData = [
            'organization_id' => $request->user()->organizations->first()?->id,
            'name' => $validated['name'],
            'imo_number' => $validated['imo_number'],
            'vessel_type' => $validated['vessel_type'],
            'status' => $validated['status'],
            'grt' => $validated['grt'] ?? null,
            'nrt' => $validated['nrt'] ?? null,
            'build_year' => $validated['build_year'] ?? null,
            'mmsi' => $validated['mmsi'] ?? null,
            'call_sign' => $validated['call_sign'] ?? null,
            'flag_state' => $validated['flag_state'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ];

        // Convert DWT from tons to kilograms for storage
        if (isset($validated['dwt']) && $validated['dwt'] !== null) {
            $vesselData['dwt'] = $validated['dwt'] * 1000;
        }

        // Convert length measurements from meters to millimeters for storage
        if (isset($validated['loa']) && $validated['loa'] !== null) {
            $vesselData['loa'] = $validated['loa'] * 1000;
        }
        if (isset($validated['beam']) && $validated['beam'] !== null) {
            $vesselData['beam'] = $validated['beam'] * 1000;
        }
        if (isset($validated['draft']) && $validated['draft'] !== null) {
            $vesselData['draft'] = $validated['draft'] * 1000;
        }

        $vessel = Vessel::create($vesselData);

        // Check if we should redirect to the show page or stay on form
        if ($request->get('action') === 'view') {
            return to_route('vessels.show', $vessel)->with('message', 'Vessel created successfully!');
        } elseif ($request->get('action') === 'another') {
            return to_route('vessels.create')->with('message', 'Vessel created successfully!');
        }

        // Default behavior for existing functionality/tests
        return to_route('vessels.index')->with('message', 'Vessel created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Vessel::class);

        return Inertia::render('vessels/create-vessel-page');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vessel $vessel)
    {
        Gate::authorize('view', $vessel);

        return Inertia::render('vessels/show-vessel-page', [
            'vessel' => $vessel,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vessel $vessel)
    {
        Gate::authorize('update', $vessel);

        return Inertia::render('vessels/edit-vessel-page', [
            'vessel' => $vessel,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVesselRequest $request, Vessel $vessel)
    {
        Gate::authorize('update', $vessel);

        $validated = $request->validated();

        // Convert units for storage (frontend sends user-friendly units, we store in base SI units)
        $vesselData = [
            'name' => $validated['name'],
            'imo_number' => $validated['imo_number'],
            'vessel_type' => $validated['vessel_type'],
            'status' => $validated['status'],
            'grt' => $validated['grt'] ?? null,
            'nrt' => $validated['nrt'] ?? null,
            'build_year' => $validated['build_year'] ?? null,
            'mmsi' => $validated['mmsi'] ?? null,
            'call_sign' => $validated['call_sign'] ?? null,
            'flag_state' => $validated['flag_state'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ];

        // Convert DWT from tons to kilograms for storage
        if (isset($validated['dwt'])) {
            $vesselData['dwt'] = $validated['dwt'] !== null ? $validated['dwt'] * 1000 : null;
        }

        // Convert length measurements from meters to millimeters for storage
        if (isset($validated['loa'])) {
            $vesselData['loa'] = $validated['loa'] !== null ? $validated['loa'] * 1000 : null;
        }
        if (isset($validated['beam'])) {
            $vesselData['beam'] = $validated['beam'] !== null ? $validated['beam'] * 1000 : null;
        }
        if (isset($validated['draft'])) {
            $vesselData['draft'] = $validated['draft'] !== null ? $validated['draft'] * 1000 : null;
        }

        $vessel->update($vesselData);

        return to_route('vessels.index')->with('message', 'Vessel updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vessel $vessel)
    {
        Gate::authorize('delete', $vessel);

        $vessel->delete();

        return to_route('vessels.index')->with('message', 'Vessel deleted successfully!');
    }
}
