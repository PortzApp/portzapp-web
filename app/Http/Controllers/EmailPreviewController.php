<?php

namespace App\Http\Controllers;

use App\Enums\OrganizationBusinessType;
use App\Enums\UserRoles;
use App\Models\Invitation;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Support\Facades\View;
use Inertia\Inertia;

class EmailPreviewController extends Controller
{
    /**
     * Display a listing of available email templates.
     */
    public function index()
    {
        $templates = [
            [
                'name' => 'verification',
                'title' => 'Email Verification',
                'description' => 'Sent to users to verify their email address',
                'type' => 'notification',
            ],
            [
                'name' => 'invitation',
                'title' => 'Organization Invitation',
                'description' => 'Sent to invite users to join an organization',
                'type' => 'mailable',
            ],
            [
                'name' => 'invitation-reminder',
                'title' => 'Invitation Reminder',
                'description' => 'Reminder sent when invitation is expiring soon',
                'type' => 'mailable',
            ],
        ];

        return Inertia::render('emails/index', [
            'templates' => $templates,
        ]);
    }

    /**
     * Display the specified email template with mock data.
     */
    public function show(string $template)
    {
        return match ($template) {
            'verification' => $this->previewVerificationEmail(),
            'invitation' => $this->previewInvitationEmail(),
            'invitation-reminder' => $this->previewInvitationReminderEmail(),
            default => abort(404, 'Email template not found'),
        };
    }

    /**
     * Preview the verification email template.
     */
    private function previewVerificationEmail()
    {
        $mockUser = new User([
            'first_name' => 'John',
            'last_name' => 'Smith',
            'email' => 'john.smith@example.com',
        ]);

        $mockVerificationUrl = url('/verify-email/mock-token');

        return View::make('emails.verification', [
            'user' => $mockUser,
            'verificationUrl' => $mockVerificationUrl,
        ]);
    }

    /**
     * Preview the invitation email template.
     */
    private function previewInvitationEmail()
    {
        $mockOrganization = new Organization([
            'name' => 'Pacific Maritime Solutions',
            'business_type' => OrganizationBusinessType::SHIPPING_AGENCY,
        ]);

        $mockInviter = new User([
            'first_name' => 'Sarah',
            'last_name' => 'Johnson',
            'email' => 'sarah.johnson@pacificmaritime.com',
        ]);

        $mockInvitation = new Invitation([
            'email' => 'newuser@example.com',
            'role' => UserRoles::OPERATIONS,
            'token' => 'mock-invitation-token',
            'expires_at' => now()->addDays(7),
        ]);

        // Simulate relationships
        $mockInvitation->setRelation('organization', $mockOrganization);
        $mockInvitation->setRelation('invitedByUser', $mockInviter);

        return View::make('emails.invitation', [
            'invitation' => $mockInvitation,
            'organization' => $mockOrganization,
            'invitedBy' => $mockInviter,
            'customMessage' => 'We would love to have you join our team! Your expertise in logistics would be a great addition to our operations.',
            'acceptUrl' => route('register', ['invite' => 'mock-invitation-token']),
            'declineUrl' => url('/invitations/mock-invitation-token/decline'),
            'roleName' => UserRoles::OPERATIONS->label(),
            'expiresAt' => now()->addDays(7),
        ]);
    }

    /**
     * Preview the invitation reminder email template.
     */
    private function previewInvitationReminderEmail()
    {
        $mockOrganization = new Organization([
            'name' => 'Atlantic Vessel Management',
            'business_type' => OrganizationBusinessType::VESSEL_OWNER,
        ]);

        $mockInviter = new User([
            'first_name' => 'Michael',
            'last_name' => 'Chen',
            'email' => 'michael.chen@atlanticvessel.com',
        ]);

        $mockInvitation = new Invitation([
            'email' => 'captain@example.com',
            'role' => UserRoles::MANAGER,
            'token' => 'mock-reminder-token',
            'expires_at' => now()->addDays(2),
        ]);

        // Manually set the created_at timestamp
        $mockInvitation->created_at = now()->subDays(5);

        // Simulate relationships
        $mockInvitation->setRelation('organization', $mockOrganization);
        $mockInvitation->setRelation('invitedByUser', $mockInviter);

        $daysUntilExpiry = 2;

        return View::make('emails.invitation-reminder', [
            'invitation' => $mockInvitation,
            'organization' => $mockOrganization,
            'invitedBy' => $mockInviter,
            'acceptUrl' => route('register', ['invite' => 'mock-reminder-token']),
            'declineUrl' => url('/invitations/mock-reminder-token/decline'),
            'roleName' => UserRoles::MANAGER->label(),
            'expiresAt' => now()->addDays(2),
            'daysUntilExpiry' => $daysUntilExpiry,
        ]);
    }
}
