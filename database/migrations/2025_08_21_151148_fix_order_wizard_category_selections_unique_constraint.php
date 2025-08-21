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
        Schema::table('order_wizard_category_selections', function (Blueprint $table) {
            // Drop the existing unique constraint that causes the duplicate key error
            $table->dropUnique(['session_id', 'service_category_id']);

            // Drop the existing non-unique index first
            $table->dropIndex(['session_id', 'service_sub_category_id']);

            // Add new unique constraint on session_id and service_sub_category_id
            // This prevents selecting the same sub-category twice, but allows multiple
            // sub-categories from the same parent category
            $table->unique(['session_id', 'service_sub_category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_wizard_category_selections', function (Blueprint $table) {
            // Restore the original constraints and indexes
            $table->dropUnique(['session_id', 'service_sub_category_id']);
            $table->unique(['session_id', 'service_category_id']);
            $table->index(['session_id', 'service_sub_category_id']);
        });
    }
};
