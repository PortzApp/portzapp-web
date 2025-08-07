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
        Schema::create('order_vessel', function (Blueprint $table) {
            $table->foreignUlid('order_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('vessel_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['order_id', 'vessel_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_vessel');
    }
};
