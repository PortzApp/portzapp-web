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
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

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
        /** @var \App\Models\Organization $organization */
        $organization = $this->invitation->organization;
        $organizationName = $organization->name;

        /** @var \App\Models\User|null $invitedByUser */
        $invitedByUser = $this->invitation->invitedByUser;

        return new Envelope(
            subject: "You're invited to join {$organizationName} on PortzApp",
            from: config('mail.from.address'),
            replyTo: $invitedByUser?->email ? [$invitedByUser->email] : [],
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
        return route('register', [
            'invite' => $this->invitation->token,
        ]);
    }

    /**
     * Get the invitation decline URL.
     */
    private function getDeclineUrl(): string
    {
        // For now, we'll just link to the home page for decline
        // This could be enhanced later with a proper decline endpoint
        return route('home');
    }

    /**
     * Get the human-readable role name.
     */
    private function getRoleName(): string
    {
        return $this->invitation->role->label();
    }
}
