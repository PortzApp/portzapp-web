<?php

namespace App\Http\Controllers;

use App\Http\Requests\ServiceCreateRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     */
    public function index(): Response
    {
        return Inertia::render('services', [
            'services' => Service::with('user')->latest()->get(),
        ]);
    }

    /**
     * Store a newly created service in storage.
     */
    public function store(ServiceCreateRequest $request): RedirectResponse
    {
        auth()->user()->services()->create($request->validated());

        return to_route('services')->with('message', 'Service created successfully!');
    }

    /**
     * Remove the specified service from storage.
     */
    public function destroy(Service $service): RedirectResponse
    {
        // Ensure the service belongs to the authenticated user
        if ($service->user_id !== auth()->id()) {
            abort(403, 'Unauthorized action.');
        }

        $service->delete();

        return to_route('services')->with('message', 'Service deleted successfully!');
    }
}
