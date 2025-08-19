<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SwitchOrganization extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'organization_id' => [
                'required',
                'exists:organizations,id',
                Rule::exists('organization_user', 'organization_id')->where('user_id', $user->id),
            ],
        ], [
            'organization_id.exists' => 'You are not a member of this organization.',
        ]);

        $user->current_organization_id = $validated['organization_id'];
        $user->save();

        return back();
    }
}
