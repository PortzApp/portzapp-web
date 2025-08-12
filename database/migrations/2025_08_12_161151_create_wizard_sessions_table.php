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
        Schema::create('wizard_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')
                ->constrained()
                ->onDelete('cascade');
            $table->string('session_token')->unique();
            $table->string('current_step');
            $table->json('data');
            $table->timestamp('expires_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wizard_sessions');
    }
};
