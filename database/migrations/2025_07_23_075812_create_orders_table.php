<?php

use App\Enums\OrderStatus;
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
            $table->string('order_number')->unique();
            $table->foreignUlid('vessel_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('port_id')->constrained()->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('placed_by_user_id')->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('placed_by_organization_id')->constrained('organizations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->text('notes')->nullable();
            $table->string('status')->default(OrderStatus::PENDING->value)->index();
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
