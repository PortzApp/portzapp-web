<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateOrderGroupServiceStatusRequest;
use App\Models\OrderGroupService;
use Illuminate\Support\Facades\Gate;

class OrderGroupServiceController extends Controller
{
    /**
     * Update the status of a specific order group service.
     */
    public function updateStatus(UpdateOrderGroupServiceStatusRequest $request, OrderGroupService $orderGroupService)
    {
        Gate::authorize('update', $orderGroupService->orderGroup);

        $validated = $request->validated();

        $orderGroupService->update([
            'status' => $validated['status'],
        ]);

        return back()->with('message', 'Service status updated successfully!');
    }
}
