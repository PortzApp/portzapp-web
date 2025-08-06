<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SwitchOrganization extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $validated = $request->validate([
            'organization_id' => ['required', 'exists:organizations,id'],
        ]);

        $user = $request->user();
        $user->current_organization_id = $validated['organization_id'];
        $user->save();

        return back();
    }
}
