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
        Schema::create('service_sub_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('service_category_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Unique constraint and indices for performance
            $table->unique(['service_category_id', 'name']);
            $table->index('service_category_id');
            $table->index('sort_order');
            $table->index(['service_category_id', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_sub_categories');
    }
};
