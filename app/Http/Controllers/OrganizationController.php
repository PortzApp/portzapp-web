<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Organization $organization)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit()
    {
        $user = auth()->user();

        // Check if the user has a current organization
        if (! $user->current_organization_id) {
            abort(404, 'No current organization found.');
        }

        // Get the user's current organization
        $currentOrganization = $user->currentOrganization;

        if (! $currentOrganization) {
            abort(404, 'Current organization not found.');
        }

        // Fetch users with their pivot data (including roles) for the current organization
        $organizationUsers = $currentOrganization->users()->get();

        return Inertia::render('settings/organization', [
            'users' => $organizationUsers,
            'organization' => $currentOrganization,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Organization $organization)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Organization $organization)
    {
        //
    }
}
