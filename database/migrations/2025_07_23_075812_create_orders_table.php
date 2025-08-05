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
        Schema::create('orders', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('vessel_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('requesting_organization_id')->constrained('organizations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('providing_organization_id')->constrained('organizations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->decimal('price', 12, 2);
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])->default('pending');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
