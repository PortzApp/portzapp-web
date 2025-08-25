<?php

use App\Enums\OrderGroupStatus;
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
        Schema::create('order_groups', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('group_number')->unique();
            $table->foreignUlid('order_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('fulfilling_organization_id')->constrained('organizations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('status')->default(OrderGroupStatus::PENDING->value);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indices for common queries
            $table->index('status');
            $table->index('order_id');
            $table->index('fulfilling_organization_id');
            $table->index(['order_id', 'fulfilling_organization_id']);
            $table->index(['fulfilling_organization_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_groups');
    }
};
