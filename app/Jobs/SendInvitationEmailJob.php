<?php

namespace App\Jobs;

use App\Mail\InvitationEmail;
use App\Models\Invitation;
use Illuminate\Bus\Batchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendInvitationEmailJob implements ShouldQueue
{
    use Batchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The maximum number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public Invitation $invitation,
        public ?string $customMessage = null
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Skip if batch is cancelled
        if ($this->batch()?->cancelled()) {
            return;
        }

        try {
            Log::info('📤 Sending invitation email via job', [
                'invitation_id' => $this->invitation->id,
                'email' => $this->invitation->email,
                'job_id' => $this->job?->getJobId(),
            ]);

            Mail::to($this->invitation->email)->send(
                new InvitationEmail($this->invitation, $this->customMessage)
            );

            Log::info('✅ Invitation email sent successfully via job', [
                'invitation_id' => $this->invitation->id,
                'email' => $this->invitation->email,
                'job_id' => $this->job?->getJobId(),
            ]);
        } catch (\Exception $e) {
            Log::error('❌ Failed to send invitation email via job', [
                'invitation_id' => $this->invitation->id,
                'email' => $this->invitation->email,
                'error_message' => $e->getMessage(),
                'job_id' => $this->job?->getJobId(),
            ]);

            // Delete the invitation if email fails completely
            if ($this->attempts() >= $this->tries) {
                Log::info('🗑️ Deleting invitation after max attempts', [
                    'invitation_id' => $this->invitation->id,
                ]);
                $this->invitation->delete();
            }

            throw $e;
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('💥 SendInvitationEmailJob failed permanently', [
            'invitation_id' => $this->invitation->id,
            'email' => $this->invitation->email,
            'error' => $exception->getMessage(),
        ]);
    }
}
