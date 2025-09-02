<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\InvitationType;
use App\Enums\UserRoles;
use App\Http\Requests\BulkInvitationRequest;
use App\Http\Requests\SendInvitationRequest;
use App\Jobs\SendInvitationEmailJob;
use App\Models\Invitation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;
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

        // Queue invitation email
        try {
            SendInvitationEmailJob::dispatch($invitation, $validated['message'] ?? null);

            Log::info('✅ Invitation email job dispatched', [
                'invitation_id' => $invitation->id,
                'email' => $validated['email'],
            ]);
        } catch (\Exception $e) {
            // Delete the invitation if job dispatch fails
            $invitation->delete();

            Log::error('❌ Failed to dispatch invitation email job', [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['email' => 'Failed to queue invitation email. Please try again.']);
        }

        return back()->with('message', 'Invitation sent successfully!');
    }

    /**
     * Send multiple invitations to join the organization using batch jobs.
     */
    public function bulkCreate(BulkInvitationRequest $request)
    {
        /** @var User $user */
        $user = auth()->user();

        $validated = $request->validated();
        $organizationId = $validated['organization_id'];
        $invites = $validated['invites'];

        Log::info('📧 BULK INVITATION PROCESS STARTED', [
            'user_id' => $user->id,
            'organization_id' => $organizationId,
            'invites_count' => count($invites),
        ]);

        // Get the organization from the request (not necessarily the user's current org during onboarding)
        $organization = \App\Models\Organization::find($organizationId);
        if (! $organization) {
            return back()->withErrors(['organization_id' => 'Organization not found.']);
        }

        // Check if user has access to this organization
        if (! $user->organizations()->where('organizations.id', $organization->id)->exists()) {
            return back()->withErrors(['organization_id' => 'You do not have access to this organization.']);
        }

        $validInvitations = [];
        $validationErrors = [];

        // Pre-validate and create invitation records
        foreach ($invites as $inviteData) {
            $email = $inviteData['email'];
            $role = UserRoles::from($inviteData['role']);

            // Check if user is already in the organization
            if ($organization->users()->where('email', $email)->exists()) {
                $validationErrors[] = "User {$email} is already a member of your organization.";

                continue;
            }

            // Check if there's already a pending invitation
            $existingInvitation = Invitation::where('email', $email)
                ->where('organization_id', $organization->id)
                ->where('status', InvitationStatus::PENDING)
                ->where('expires_at', '>', now())
                ->first();

            if ($existingInvitation) {
                $validationErrors[] = "An invitation has already been sent to {$email}.";

                continue;
            }

            // Create new invitation
            $invitation = Invitation::query()->create([
                'type' => InvitationType::ORGANIZATION_INVITATION,
                'email' => $email,
                'invited_by_user_id' => $user->id,
                'organization_id' => $organization->id,
                'role' => $role,
                'status' => InvitationStatus::PENDING,
                'token' => Str::random(64),
                'expires_at' => Carbon::now()->addWeeks(2),
                'metadata' => [],
            ]);

            $validInvitations[] = $invitation;
        }

        if (empty($validInvitations)) {
            $errorMessage = empty($validationErrors)
                ? 'No valid invitations to send.'
                : implode(' ', $validationErrors);

            return back()->withErrors(['bulk_invite' => $errorMessage]);
        }

        // Create batch of email jobs
        $jobs = collect($validInvitations)->map(function ($invitation) {
            return new SendInvitationEmailJob($invitation);
        });

        $batch = Bus::batch($jobs)
            ->name('Bulk Invitation Email Batch')
            ->then(function () use ($organization): void {
                Log::info('✅ Bulk invitation batch completed successfully', [
                    'organization_id' => $organization->id,
                ]);
            })
            ->catch(function ($batch, \Throwable $e) use ($organization): void {
                Log::error('❌ Bulk invitation batch failed', [
                    'organization_id' => $organization->id,
                    'error' => $e->getMessage(),
                    'failed_jobs' => $batch->failedJobs,
                ]);
            })
            ->finally(function () use ($organization): void {
                Log::info('🏁 Bulk invitation batch processing finished', [
                    'organization_id' => $organization->id,
                ]);
            })
            ->dispatch();

        Log::info('🚀 Bulk invitation batch dispatched', [
            'batch_id' => $batch->id,
            'jobs_count' => count($validInvitations),
            'validation_errors_count' => count($validationErrors),
        ]);

        $message = count($validInvitations) === 1
            ? 'Invitation has been queued for sending!'
            : count($validInvitations).' invitations have been queued for sending!';

        if (! empty($validationErrors)) {
            return back()
                ->with('message', $message)
                ->withErrors(['bulk_invite' => implode(' ', $validationErrors)]);
        }

        return back()->with('message', $message);
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

        // Queue invitation email
        try {
            $customMessage = $invitation->metadata['custom_message'] ?? null;
            SendInvitationEmailJob::dispatch($invitation, $customMessage);

            Log::info('✅ Invitation resend email job dispatched', [
                'invitation_id' => $invitation->id,
                'email' => $invitation->email,
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to dispatch invitation resend email job', [
                'invitation_id' => $invitation->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['message' => 'Failed to queue invitation email. Please try again.']);
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
                    'id' => $invitation->organization->getAttribute('id'),
                    'name' => $invitation->organization->getAttribute('name'),
                    'business_type' => $invitation->organization->getAttribute('business_type')?->value,
                    'business_type_label' => $invitation->organization->getAttribute('business_type')?->label(),
                ],
                'invited_by' => $invitation->invitedByUser ? [
                    'name' => $invitation->invitedByUser->getAttribute('first_name').' '.$invitation->invitedByUser->getAttribute('last_name'),
                ] : null,
                'expires_at' => $invitation->expires_at->toISOString(),
            ],
        ]);
    }
}
