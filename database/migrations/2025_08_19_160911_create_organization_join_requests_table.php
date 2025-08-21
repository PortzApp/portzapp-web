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
        Schema::create('organization_join_requests', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users');
            $table->foreignUlid('organization_id')->constrained('organizations');
            $table->string('status'); // JoinRequestStatus enum
            $table->text('message')->nullable(); // User's request message
            $table->text('admin_notes')->nullable(); // Admin's notes when approving/rejecting
            $table->foreignUlid('reviewed_by_user_id')->nullable()->constrained('users');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'organization_id']);
            $table->index(['organization_id', 'status']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('organization_join_requests');
    }
};
