<?php

namespace App\Notifications;

use App\Models\OrganizationJoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinRequestCreated extends Notification implements ShouldQueue
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
        $organization = $this->joinRequest->organization;
        $user = $this->joinRequest->user;

        return (new MailMessage)
            ->subject("New Join Request for {$organization->name}")
            ->greeting("Hello {$notifiable->first_name},")
            ->line('A new user has requested to join your organization.')
            ->line("**User:** {$user->first_name} {$user->last_name}")
            ->line("**Email:** {$user->email}")
            ->line("**Organization:** {$organization->name}")
            ->when($this->joinRequest->message, function ($mail) {
                return $mail->line("**Message:** {$this->joinRequest->message}");
            })
            ->action('Review Request', url("/organizations/{$this->joinRequest->organization_id}/join-requests"))
            ->line('Please review this request and approve or reject it as appropriate.')
            ->salutation('Best regards, PortzApp Team');
    }
}
