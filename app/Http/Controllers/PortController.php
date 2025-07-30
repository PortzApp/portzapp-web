<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePortRequest;
use App\Http\Requests\UpdatePortRequest;
use App\Models\Port;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class PortController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        Gate::authorize('view-any', Port::class);

        $ports = Port::query()->latest()->get();

        return Inertia::render('ports/index', [
            'ports' => $ports,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePortRequest $request)
    {
        Gate::authorize('create', Port::class);

        $port = Port::create($request->validated());

        return to_route('ports.index')->with('message', 'Port created successfully!');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        Gate::authorize('create', Port::class);

        return Inertia::render('ports/create');
    }

    /**
     * Display the specified resource.
     */
    public function show(Port $port)
    {
        Gate::authorize('view', $port);

        return Inertia::render('ports/show', [
            'port' => $port,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Port $port)
    {
        Gate::authorize('update', $port);

        return Inertia::render('ports/edit', [
            'port' => $port,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePortRequest $request, Port $port)
    {
        Gate::authorize('update', $port);

        $validated = $request->validated();

        $port->update($validated);

        return to_route('ports.index')->with('message', 'Port updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Port $port)
    {
        Gate::authorize('delete', $port);

        $port->delete();

        return to_route('ports.index')->with('message', 'Port deleted successfully!');
    }
}
