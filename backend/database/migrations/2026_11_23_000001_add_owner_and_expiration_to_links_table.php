<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('links', function (Blueprint $table) {
            // dono = admin (user_id) OU sessão anônima (session_hash)
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->string('session_hash', 64)->nullable()->index();
            $table->timestamp('expires_at')->nullable()->index();
        });

        // links antigos (sem dono) ganham 1 semana a partir do deploy
        DB::table('links')->whereNull('expires_at')->update(['expires_at' => now()->addWeek()]);
    }

    public function down(): void
    {
        Schema::table('links', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn(['session_hash', 'expires_at']);
        });
    }
};