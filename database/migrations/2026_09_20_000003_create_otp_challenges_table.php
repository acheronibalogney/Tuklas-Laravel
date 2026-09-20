<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('otp_challenges', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('token_hash')->unique(); $table->string('code_hash'); $table->unsignedTinyInteger('attempts')->default(0); $table->timestamp('expires_at'); $table->timestamps(); $table->index(['user_id', 'expires_at']); }); }
    public function down(): void { Schema::dropIfExists('otp_challenges'); }
};
