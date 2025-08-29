<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\InvitationType;
use App\Enums\UserRoles;
use App\Http\Requests\SendInvitationRequest;
use App\Mail\InvitationEmail;
use App\Models\Invitation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InvitationController extends Controller
{
    /**
     * Send an invitation to join the organization.
     */
    public function sendInvitation(SendInvitationRequest $request)
    {
        /** @var User $user */
        $user = auth()->user();

        // Check if user can invite members to their current organization
        if (! $user->current_organization_id) {
            return back()->withErrors(['email' => 'No current organization found.']);
        }

        $organization = $user->currentOrganization;
        if (! $organization) {
            return back()->withErrors(['email' => 'Current organization not found.']);
        }

        $validated = $request->validated();

        // Check if user is already in the organization
        $existingMember = $organization->users()->where('email', $validated['email'])->exists();
        if ($existingMember) {
            return back()->withErrors(['email' => 'This user is already a member of your organization.']);
        }

        // Check if there's already a pending invitation for this email in this organization
        $existingInvitation = Invitation::where('email', $validated['email'])
            ->where('organization_id', $organization->id)
            ->where('status', InvitationStatus::PENDING)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingInvitation) {
            return back()->withErrors(['email' => 'An invitation has already been sent to this email address.']);
        }

        // Create new invitation
        $invitation = Invitation::query()->create([
            'type' => InvitationType::ORGANIZATION_INVITATION,
            'email' => $validated['email'],
            'invited_by_user_id' => $user->id,
            'organization_id' => $organization->id,
            'role' => UserRoles::from($validated['role']),
            'status' => InvitationStatus::PENDING,
            'token' => Str::random(64),
            'expires_at' => Carbon::now()->addWeeks(2),
            'metadata' => [
                'custom_message' => $validated['message'] ?? null,
            ],
        ]);

        // Send invitation email
        try {
            Mail::to($validated['email'])->send(new InvitationEmail($invitation, $validated['message'] ?? null));
        } catch (\Exception $e) {
            // Delete the invitation if email fails to send
            $invitation->delete();

            return back()->withErrors(['email' => 'Failed to send invitation email. Please try again.']);
        }

        return back()->with('message', 'Invitation sent successfully!');
    }

    /**
     * List invitations for the current organization.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth()->user();

        if (! $user->current_organization_id) {
            return response()->json(['error' => 'No current organization found.'], 400);
        }

        $organization = $user->currentOrganization;
        if (! $organization) {
            return response()->json(['error' => 'Current organization not found.'], 400);
        }

        $invitations = Invitation::where('organization_id', $organization->id)
            ->with(['invitedByUser:id,first_name,last_name,email'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['invitations' => $invitations]);
    }

    /**
     * Cancel/delete an invitation.
     */
    public function destroy(Invitation $invitation)
    {
        /** @var User $user */
        $user = auth()->user();

        // Ensure the invitation belongs to the user's current organization
        if ($invitation->organization_id !== $user->current_organization_id) {
            return back()->withErrors(['message' => 'You cannot cancel this invitation.']);
        }

        $invitation->delete();

        return back()->with('message', 'Invitation cancelled successfully.');
    }

    /**
     * Resend an invitation email.
     */
    public function resend(Invitation $invitation)
    {
        /** @var User $user */
        $user = auth()->user();

        // Ensure the invitation belongs to the user's current organization
        if ($invitation->organization_id !== $user->current_organization_id) {
            return back()->withErrors(['message' => 'You cannot resend this invitation.']);
        }

        // Check if invitation is still valid
        if ($invitation->status !== InvitationStatus::PENDING || $invitation->isExpired()) {
            return back()->withErrors(['message' => 'This invitation is no longer valid and cannot be resent.']);
        }

        // Extend expiration and regenerate token
        $invitation->update([
            'token' => Str::random(64),
            'expires_at' => Carbon::now()->addWeeks(2),
        ]);

        // Send invitation email
        try {
            $customMessage = $invitation->metadata['custom_message'] ?? null;
            Mail::to($invitation->email)->send(new InvitationEmail($invitation, $customMessage));
        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Failed to resend invitation email. Please try again.']);
        }

        return back()->with('message', 'Invitation resent successfully!');
    }

    /**
     * Get invitation details by token (for registration process).
     */
    public function show(Request $request): JsonResponse
    {
        $token = $request->query('token');

        if (! $token) {
            return response()->json(['error' => 'Invitation token is required.'], 400);
        }

        $invitation = Invitation::where('token', $token)
            ->where('status', InvitationStatus::PENDING)
            ->where('expires_at', '>', now())
            ->with(['organization:id,name,business_type', 'invitedByUser:id,first_name,last_name'])
            ->first();

        if (! $invitation) {
            return response()->json(['error' => 'Invalid or expired invitation.'], 404);
        }

        return response()->json([
            'invitation' => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'role' => $invitation->role->value,
                'role_label' => $invitation->role->label(),
                'organization' => [
                    'id' => $invitation->organization->id,
                    'name' => $invitation->organization->name,
                    'business_type' => $invitation->organization->business_type->value,
                    'business_type_label' => $invitation->organization->business_type->label(),
                ],
                'invited_by' => $invitation->invitedByUser ? [
                    'name' => $invitation->invitedByUser->first_name.' '.$invitation->invitedByUser->last_name,
                ] : null,
                'expires_at' => $invitation->expires_at->toISOString(),
            ],
        ]);
    }
}
