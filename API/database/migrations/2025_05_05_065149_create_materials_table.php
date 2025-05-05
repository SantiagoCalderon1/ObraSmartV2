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
        Schema::create('materials', function (Blueprint $table) {
            $table->id("material_id");
            $table->string('name');
            $table->enum('unit', ['kg', 'm2', 'lt', 'unidades'])->default('unidades');
            $table->decimal('price_per_unit', 10, 2)->nullable();
            $table->integer('stock_quantity')->nullable();
            $table->integer('min_stock_alert')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
