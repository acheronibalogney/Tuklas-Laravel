<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('scans', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('scan_id')->unique(); $table->string('folder_name')->nullable(); $table->string('file_name')->nullable(); $table->string('source')->nullable(); $table->timestamp('analyzed_at')->nullable(); $table->jsonb('analysis'); $table->timestamps(); });
        Schema::create('folders', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->string('folder_id')->unique(); $table->string('folder_name'); $table->string('type')->default('scan'); $table->jsonb('metadata')->nullable(); $table->timestamps(); });
        Schema::create('documents', function (Blueprint $table) { $table->id(); $table->foreignId('user_id')->constrained()->cascadeOnDelete(); $table->foreignId('folder_id')->nullable()->constrained('folders')->nullOnDelete(); $table->string('name'); $table->string('path')->nullable(); $table->string('mime_type')->nullable(); $table->unsignedBigInteger('size')->default(0); $table->string('category')->default('scan'); $table->string('status')->default('uploaded'); $table->timestamps(); });
        Schema::create('examples', function (Blueprint $table) { $table->id(); $table->string('title'); $table->text('description')->nullable(); $table->jsonb('payload')->nullable(); $table->timestamps(); });
    }
    public function down(): void { Schema::dropIfExists('examples'); Schema::dropIfExists('documents'); Schema::dropIfExists('folders'); Schema::dropIfExists('scans'); }
};
