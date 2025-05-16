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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id("stock_movement_id");
            $table->unsignedBigInteger('material_id')->nullable();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->integer('quantity');  // positivo = ingreso, negativo = consumo
            $table->enum('reason', ['compra', 'uso', 'ajuste'])->default('uso');

            $table->timestamps();

            $table->foreign('project_id')->references('project_id')->on('projects')->onDelete('set null');
            $table->foreign('material_id')->references('material_id')->on('materials')->onDelete('set null');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
