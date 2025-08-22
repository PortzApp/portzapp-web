<?php

namespace App\Notifications;

use App\Models\OrganizationJoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinRequestApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public OrganizationJoinRequest $joinRequest
    ) {}

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        /** @var \App\Models\Organization $organization */
        $organization = $this->joinRequest->organization;

        /** @var \App\Models\User $user */
        $user = $notifiable;

        return (new MailMessage)
            ->subject("Welcome to {$organization->name}!")
            ->greeting("Hello {$user->first_name},")
            ->line("Great news! Your request to join {$organization->name} has been approved.")
            ->line("You now have access to the organization's resources and can start collaborating with the team.")
            ->when($this->joinRequest->admin_notes, function ($mail) {
                return $mail->line("**Admin Message:** {$this->joinRequest->admin_notes}");
            })
            ->action('Access Organization', url('/dashboard'))
            ->line('Welcome to the team!')
            ->salutation('Best regards, PortzApp Team');
    }
}
