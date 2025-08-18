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
            // Add column to store the actual selected sub-category
            $table->foreignUlid('service_sub_category_id')->nullable()->after('service_category_id')
                ->constrained('service_sub_categories')->cascadeOnUpdate()->cascadeOnDelete();

            // Add index for efficient queries
            $table->index(['session_id', 'service_sub_category_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_wizard_category_selections', function (Blueprint $table) {
            $table->dropForeign(['service_sub_category_id']);
            $table->dropIndex(['session_id', 'service_sub_category_id']);
            $table->dropColumn('service_sub_category_id');
        });
    }
};
