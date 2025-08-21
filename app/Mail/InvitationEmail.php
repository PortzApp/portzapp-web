<?php

namespace App\Mail;

use App\Models\Invitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvitationEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Invitation $invitation,
        public ?string $customMessage = null
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $organizationName = $this->invitation->organization->name;

        return new Envelope(
            subject: "You're invited to join {$organizationName} on PortzApp",
            from: config('mail.from.address'),
            replyTo: $this->invitation->invitedByUser?->email,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.invitation',
            with: [
                'invitation' => $this->invitation,
                'organization' => $this->invitation->organization,
                'invitedBy' => $this->invitation->invitedByUser,
                'customMessage' => $this->customMessage,
                'acceptUrl' => $this->getAcceptUrl(),
                'declineUrl' => $this->getDeclineUrl(),
                'roleName' => $this->getRoleName(),
                'expiresAt' => $this->invitation->expires_at,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get the invitation acceptance URL.
     */
    private function getAcceptUrl(): string
    {
        return route('invitations.accept', [
            'token' => $this->invitation->token,
        ]);
    }

    /**
     * Get the invitation decline URL.
     */
    private function getDeclineUrl(): string
    {
        return route('invitations.decline', [
            'token' => $this->invitation->token,
        ]);
    }

    /**
     * Get the human-readable role name.
     */
    private function getRoleName(): string
    {
        $roleLabels = [
            'ADMIN' => 'Administrator',
            'CEO' => 'Chief Executive Officer',
            'MANAGER' => 'Manager',
            'OPERATIONS' => 'Operations',
            'FINANCE' => 'Finance',
            'VIEWER' => 'Viewer',
        ];

        return $roleLabels[$this->invitation->role->value] ?? $this->invitation->role->value;
    }
}
