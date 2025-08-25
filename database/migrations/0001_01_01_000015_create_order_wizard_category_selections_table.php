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
        Schema::create('order_wizard_category_selections', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('session_id')->constrained('order_wizard_sessions')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('service_category_id')->constrained('service_categories')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('service_sub_category_id')->nullable()->after('service_category_id')
                ->constrained('service_sub_categories')->cascadeOnUpdate()->cascadeOnDelete();
            $table->integer('order_index')->default(0); // For ordering categories in step 3
            $table->timestamps();

            // Prevent duplicate sub-category selections per session (updated constraint)
            $table->unique(['session_id', 'service_sub_category_id']);

            // Index for efficient queries
            $table->index('service_category_id');
            $table->index(['session_id', 'order_index'], 'owcs_session_order_idx');
            $table->index(['session_id', 'service_sub_category_id'], 'owcs_session_subcategory_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_wizard_category_selections');
    }
};
