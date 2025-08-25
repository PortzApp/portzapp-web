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
        Schema::create('order_group_services', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('order_group_id');
            $table->ulid('service_id');
            $table->string('status')->default('pending');
            $table->text('notes')->nullable();
            $table->decimal('price_snapshot', 10, 2);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('order_group_id')->references('id')->on('order_groups')->onDelete('cascade');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');

            // Unique constraint and indices for performance
            $table->unique(['order_group_id', 'service_id']);
            $table->index(['order_group_id', 'status']);
            $table->index('service_id');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_group_services');
    }
};
