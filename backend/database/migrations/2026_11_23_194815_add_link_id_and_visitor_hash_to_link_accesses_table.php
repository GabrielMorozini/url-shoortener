<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('link_accesses', function (Blueprint $table) {
            $table->foreignId('link_id')
                ->constrained('links')
                ->cascadeOnDelete();

            $table->string('visitor_hash', 64);

            $table->unique(['link_id', 'visitor_hash']);
        });
    }

    public function down(): void
    {
        Schema::table('link_accesses', function (Blueprint $table) {
            $table->dropUnique(['link_id', 'visitor_hash']);
            $table->dropConstrainedForeignId('link_id');
            $table->dropColumn('visitor_hash');
        });
    }
};