<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_groups', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('group_number')->unique();
            $table->foreignUlid('order_id')->constrained('orders')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignUlid('agency_organization_id')->constrained('organizations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('status');
            $table->decimal('subtotal_amount', 12, 2)->nullable();
            $table->dateTime('accepted_at')->nullable();
            $table->dateTime('rejected_at')->nullable();
            $table->foreignUlid('accepted_by_user_id')->nullable()->constrained('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->text('response_notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_groups');
    }
};
