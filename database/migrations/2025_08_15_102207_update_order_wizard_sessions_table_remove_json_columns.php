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
        Schema::table('order_wizard_sessions', function (Blueprint $table) {
            // Remove JSON columns that will be normalized into separate tables
            $table->dropColumn(['selected_categories', 'selected_services']);

            // Add new column for better step management
            $table->integer('current_category_index')->default(0); // For tracking which category we're selecting services for in step 3

            // current_step is already a string column with enum values, no need to change it
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_wizard_sessions', function (Blueprint $table) {
            // Restore JSON columns
            $table->json('selected_categories')->nullable();
            $table->json('selected_services')->nullable();

            // Remove new columns
            $table->dropColumn(['current_category_index']);

            // current_step is already a string column, no need to change it back
        });
    }
};
