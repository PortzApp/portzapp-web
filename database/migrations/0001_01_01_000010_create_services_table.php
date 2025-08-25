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
        Schema::create('services', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('port_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('service_sub_category_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->decimal('price', total: 10, places: 2);
            $table->string('status');
            $table->timestamps();

            // Indices for performance
            $table->index('organization_id');
            $table->index('port_id');
            $table->index('service_sub_category_id');
            $table->index('status');
            $table->index(['organization_id', 'status']);
            $table->index(['port_id', 'service_sub_category_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
