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
        Schema::create('order_wizard_service_selections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('session_id')->constrained('order_wizard_sessions')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('service_category_id')->constrained('service_categories')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('organization_id')->constrained('organizations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('price_snapshot', 10, 2); // Store price at selection time
            $table->text('notes')->nullable(); // Optional notes for this service selection
            $table->timestamps();

            // Prevent duplicate service selections per session and category
            $table->unique(['session_id', 'service_category_id', 'service_id'], 'unique_session_category_service');

            // Indexes for efficient queries
            $table->index('organization_id');
            $table->index('service_id');
            $table->index(['session_id', 'service_category_id']);
            $table->index('session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_wizard_service_selections');
    }
};
