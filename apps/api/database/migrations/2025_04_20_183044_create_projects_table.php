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
        Schema::create('projects', function (Blueprint $table) {
            $table->id("project_id");
            $table->unsignedBigInteger('client_id')->nullable();
            $table->string('name');
            $table->text('description');
            $table->enum('status', ['en proceso', 'completado', 'cancelado'])->default('en proceso');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();
            $table->foreign('client_id')->references('client_id')->on('clients')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
