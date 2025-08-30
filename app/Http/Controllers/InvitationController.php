<?php

namespace App\Http\Controllers;

use App\Enums\InvitationStatus;
use App\Enums\InvitationType;
use App\Enums\UserRoles;
use App\Http\Requests\BulkInvitationRequest;
use App\Http\Requests\SendInvitationRequest;
use App\Mail\InvitationEmail;
use App\Models\Invitation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
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
     * Send multiple invitations to join the organization.
     */
    public function bulkCreate(BulkInvitationRequest $request)
    {
        Log::info('🚀 BULK CREATE REQUEST RECEIVED', [
            'timestamp' => now()->toDateTimeString(),
            'request_data' => $request->all(),
            'headers' => $request->headers->all(),
            'method' => $request->method(),
            'url' => $request->url(),
        ]);

        /** @var User $user */
        $user = auth()->user();
        Log::info('👤 AUTHENTICATED USER', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'current_org_id' => $user->current_organization_id,
        ]);

        $validated = $request->validated();
        Log::info('✅ REQUEST VALIDATION PASSED', [
            'validated_data' => $validated,
        ]);

        $organizationId = $validated['organization_id'];
        $invites = $validated['invites'];

        Log::info('📧 BULK INVITATION PROCESS STARTED', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'organization_id' => $organizationId,
            'invites_count' => count($invites),
            'invites_details' => $invites,
            'current_organization_id' => $user->current_organization_id,
        ]);

        // Get the organization from the request (not necessarily the user's current org during onboarding)
        Log::info('🔍 FINDING ORGANIZATION', ['organization_id' => $organizationId]);
        $organization = \App\Models\Organization::find($organizationId);
        if (! $organization) {
            Log::error('❌ ORGANIZATION NOT FOUND', ['organization_id' => $organizationId]);

            return back()->withErrors(['organization_id' => 'Organization not found.']);
        }
        Log::info('✅ ORGANIZATION FOUND', [
            'organization_id' => $organization->id,
            'organization_name' => $organization->name,
        ]);

        // Check if user has access to this organization
        Log::info('🔐 CHECKING USER ACCESS TO ORGANIZATION');
        $userOrganizations = $user->organizations()->pluck('organizations.id')->toArray();
        Log::info('📋 USER ORGANIZATIONS', ['user_organizations' => $userOrganizations]);

        if (! $user->organizations()->where('organizations.id', $organization->id)->exists()) {
            Log::error('❌ USER ACCESS DENIED', [
                'user_id' => $user->id,
                'organization_id' => $organizationId,
                'user_organizations' => $userOrganizations,
            ]);

            return back()->withErrors(['organization_id' => 'You do not have access to this organization.']);
        }

        Log::info('✅ ORGANIZATION ACCESS VERIFIED', [
            'organization_name' => $organization->name,
            'user_has_access' => true,
        ]);

        $results = [
            'successful' => [],
            'failed' => [],
        ];

        Log::info('🔄 STARTING INVITATION PROCESSING LOOP', [
            'total_invites' => count($invites),
        ]);

        foreach ($invites as $index => $inviteData) {
            $email = $inviteData['email'];
            $role = UserRoles::from($inviteData['role']);

            Log::info("📧 PROCESSING INVITATION #{$index}", [
                'email' => $email,
                'role' => $role->value,
                'invite_data' => $inviteData,
            ]);

            // Check if user is already in the organization
            Log::info('🔍 CHECKING IF USER EXISTS IN ORGANIZATION', ['email' => $email]);
            if ($organization->users()->where('email', $email)->exists()) {
                Log::warning('❌ USER ALREADY EXISTS IN ORGANIZATION', ['email' => $email]);
                $results['failed'][] = [
                    'index' => $index,
                    'email' => $email,
                    'error' => 'This user is already a member of your organization.',
                ];

                continue;
            }

            // Check if there's already a pending invitation
            Log::info('🔍 CHECKING FOR EXISTING PENDING INVITATION', ['email' => $email]);
            $existingInvitation = Invitation::where('email', $email)
                ->where('organization_id', $organization->id)
                ->where('status', InvitationStatus::PENDING)
                ->where('expires_at', '>', now())
                ->first();

            if ($existingInvitation) {
                Log::warning('❌ PENDING INVITATION ALREADY EXISTS', [
                    'email' => $email,
                    'existing_invitation_id' => $existingInvitation->id,
                    'expires_at' => $existingInvitation->expires_at,
                ]);
                $results['failed'][] = [
                    'index' => $index,
                    'email' => $email,
                    'error' => 'An invitation has already been sent to this email address.',
                ];

                continue;
            }

            // Create new invitation (outside try-catch)
            Log::info('💾 CREATING NEW INVITATION RECORD', ['email' => $email]);
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

            Log::info('✅ INVITATION RECORD CREATED SUCCESSFULLY', [
                'invitation_id' => $invitation->id,
                'email' => $email,
                'token' => $invitation->token,
                'expires_at' => $invitation->expires_at,
            ]);

            // Send invitation email (only this part in try-catch)
            try {
                Log::info('📤 ATTEMPTING TO SEND EMAIL', [
                    'email' => $email,
                    'invitation_id' => $invitation->id,
                    'mail_driver' => config('mail.default'),
                    'mail_host' => config('mail.mailers.smtp.host', 'N/A'),
                ]);

                Mail::to($email)->send(new InvitationEmail($invitation, null));

                Log::info('✅ EMAIL SENT SUCCESSFULLY', [
                    'email' => $email,
                    'invitation_id' => $invitation->id,
                    'timestamp' => now()->toDateTimeString(),
                ]);

                $results['successful'][] = [
                    'index' => $index,
                    'email' => $email,
                    'invitation_id' => $invitation->id,
                ];
            } catch (\Exception $e) {
                Log::error('❌ FAILED TO SEND INVITATION EMAIL', [
                    'email' => $email,
                    'invitation_id' => $invitation->id,
                    'error_message' => $e->getMessage(),
                    'error_code' => $e->getCode(),
                    'error_file' => $e->getFile(),
                    'error_line' => $e->getLine(),
                    'full_trace' => $e->getTraceAsString(),
                ]);

                // Delete the invitation if email fails to send
                Log::info('🗑️ DELETING FAILED INVITATION RECORD', ['invitation_id' => $invitation->id]);
                $invitation->delete();
                Log::info('✅ DELETED FAILED INVITATION', ['invitation_id' => $invitation->id]);

                $results['failed'][] = [
                    'index' => $index,
                    'email' => $email,
                    'error' => 'Failed to send invitation email. Please try again.',
                ];
            }
        }

        $successCount = count($results['successful']);
        $failureCount = count($results['failed']);

        Log::info('🏁 BULK CREATE PROCESS COMPLETED', [
            'success_count' => $successCount,
            'failure_count' => $failureCount,
            'successful_emails' => array_column($results['successful'], 'email'),
            'failed_emails' => array_column($results['failed'], 'email'),
            'results_summary' => $results,
        ]);

        if ($successCount > 0 && $failureCount === 0) {
            Log::info('🎉 ALL INVITATIONS SENT SUCCESSFULLY', ['count' => $successCount]);

            return back()->with('message', "All {$successCount} invitation(s) sent successfully!");
        } elseif ($successCount > 0) {
            Log::warning('⚠️ PARTIAL SUCCESS', ['success' => $successCount, 'failures' => $failureCount]);

            return back()
                ->with('message', "{$successCount} invitation(s) sent successfully.")
                ->withErrors(['bulk_invite' => "{$failureCount} invitation(s) failed to send."]);
        } else {
            Log::error('❌ ALL INVITATIONS FAILED', ['failure_count' => $failureCount]);

            return back()->withErrors(['bulk_invite' => 'All invitations failed to send. Please check the email addresses and try again.']);
        }
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
