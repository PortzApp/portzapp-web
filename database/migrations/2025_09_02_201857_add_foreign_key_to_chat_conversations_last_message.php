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
        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->foreign('last_message_id')->references('id')->on('chat_messages')->onDelete('set null');
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->foreign('parent_message_id')->references('id')->on('chat_messages')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chat_conversations', function (Blueprint $table) {
            $table->dropForeign(['last_message_id']);
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropForeign(['parent_message_id']);
        });
    }
};
