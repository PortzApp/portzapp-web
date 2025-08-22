<?php

namespace App\Notifications;

use App\Models\OrganizationJoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class JoinRequestRejected extends Notification implements ShouldQueue
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
            ->subject("Join Request Update for {$organization->name}")
            ->greeting("Hello {$user->first_name},")
            ->line("We received your request to join {$organization->name}.")
            ->line("After review, we're unable to approve your request at this time.")
            ->when($this->joinRequest->admin_notes, function ($mail) {
                return $mail->line("**Reason:** {$this->joinRequest->admin_notes}");
            })
            ->line('If you believe this is an error or would like to discuss your request further, please contact the organization administrators directly.')
            ->line('You may also submit a new request in the future if circumstances change.')
            ->salutation('Best regards, PortzApp Team');
    }
}
