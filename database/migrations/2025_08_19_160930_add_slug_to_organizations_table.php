<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Generate slugs for existing organizations
        $organizations = DB::table('organizations')->get();
        foreach ($organizations as $organization) {
            $slug = Str::slug($organization->name);
            $counter = 1;
            $originalSlug = $slug;

            // Ensure unique slug
            while (DB::table('organizations')->where('slug', $slug)->exists()) {
                $slug = $originalSlug.'-'.$counter;
                $counter++;
            }

            DB::table('organizations')
                ->where('id', $organization->id)
                ->update(['slug' => $slug]);
        }

        // Now make slug required and add constraints
        Schema::table('organizations', function (Blueprint $table) {
            $table->string('slug')->nullable(false)->change();
            $table->unique('slug');
            $table->index(['slug']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('organizations', function (Blueprint $table) {
            $table->dropIndex(['slug']);
            $table->dropColumn('slug');
        });
    }
};
