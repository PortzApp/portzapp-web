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

        return Inertia::render('ports', [
            'ports' => $ports,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePortRequest $request)
    {
        $port = Port::create($request->validated());

        return back()->with('message', 'Port created successfully');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Port $port)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Port $port)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePortRequest $request, Port $port)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Port $port)
    {
        //
    }
}
