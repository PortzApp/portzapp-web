<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('type'); // InvitationType enum
            $table->string('email');
            $table->foreignUlid('invited_by_user_id')->constrained('users');
            $table->foreignUlid('organization_id')->constrained('organizations');
            $table->string('role'); // UserRoles enum
            $table->string('status'); // InvitationStatus enum
            $table->string('token')->unique();
            $table->timestamp('expires_at');
            $table->json('metadata')->nullable(); // For additional context like invitation message
            $table->timestamps();

            $table->index(['email', 'organization_id']);
            $table->index(['token']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
