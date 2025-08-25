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
        Schema::create('order_wizard_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('organization_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('session_name');
            $table->foreignUlid('vessel_id')->nullable()->constrained()->cascadeOnUpdate()->nullOnDelete();
            $table->foreignUlid('port_id')->nullable()->constrained()->cascadeOnUpdate()->nullOnDelete();
            $table->string('current_step')->default('vessel_port'); // vessel_port, categories, services, review
            $table->integer('current_category_index')->default(0); // For tracking which category we're selecting services for in step 3
            $table->string('status')->default('draft'); // draft, completed, abandoned
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            // Indexes for common queries
            $table->index('session_name');
            $table->index('vessel_id');
            $table->index('port_id');
            $table->index('current_step');
            $table->index('completed_at');
            $table->index(['user_id', 'status']);
            $table->index(['organization_id', 'status']);
            $table->index('expires_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_wizard_sessions');
    }
};
