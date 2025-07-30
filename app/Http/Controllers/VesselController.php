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

        return Inertia::render('vessels/index', [
            'vessels' => Vessel::query()->latest()->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVesselRequest $request)
    {
        $validated = $request->validated();

        Vessel::create([
            'organization_id' => $request->user()->organizations->first()?->id,
            'name' => $validated['name'],
            'imo_number' => $validated['imo_number'],
            'vessel_type' => $validated['vessel_type'],
            'status' => $validated['status'],
        ]);

        return to_route('vessels.index')->with('message', 'Vessel created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('vessels/create');
    }

    /**
     * Display the specified resource.
     */
    public function show(Vessel $vessel)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Vessel $vessel)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateVesselRequest $request, Vessel $vessel)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vessel $vessel)
    {
        //
    }
}
