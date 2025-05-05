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
        Schema::create('estimate_materials', function (Blueprint $table) {
            $table->id("estimate_material_id");
            $table->unsignedBigInteger('estimate_id')->nullable();
            $table->unsignedBigInteger('material_id')->nullable();
            $table->integer('quantity');
            $table->decimal('unit_price', 10, 2);
            $table->decimal('total_price', 10, 2);

            $table->timestamps();

            $table->foreign('estimate_id')->references('estimate_id')->on('estimates')->onDelete('set null');
            $table->foreign('material_id')->references('material_id')->on('materials')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estimate_materials');
    }
};
