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
        Schema::create('vessels', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('organization_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('name');
            $table->string('imo_number', 7)->nullable()->unique();
            $table->string('vessel_type', 50);
            $table->string('status', 50);

            // Core specifications
            $table->decimal('grt', 10, 2)->nullable(); // Gross Register Tonnage (dimensionless)
            $table->decimal('nrt', 10, 2)->nullable(); // Net Register Tonnage (dimensionless)
            $table->unsignedBigInteger('dwt')->nullable(); // Deadweight in kilograms
            $table->unsignedInteger('loa')->nullable(); // Length Overall in millimeters
            $table->unsignedInteger('beam')->nullable(); // Beam (width) in millimeters
            $table->unsignedInteger('draft')->nullable(); // Draft (depth) in millimeters

            // Identification & Registration
            $table->year('build_year')->nullable(); // Year of construction
            $table->string('mmsi', 9)->nullable()->unique(); // Maritime Mobile Service Identity
            $table->string('call_sign', 10)->nullable(); // Radio call sign
            $table->string('flag_state', 100)->nullable(); // Country of registration

            // Additional info
            $table->text('remarks')->nullable(); // Additional notes (max 1000 chars via validation)

            $table->timestamps();

            // Indices for performance
            $table->index('organization_id');
            $table->index('status');
            $table->index('vessel_type');
            $table->index(['organization_id', 'status']);
            $table->index('mmsi');
            $table->index('flag_state');
            $table->index('build_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vessels');
    }
};
