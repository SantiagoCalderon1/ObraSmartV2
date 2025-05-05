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
        Schema::create('estimate_labors', function (Blueprint $table) {
            $table->id("estimate_labor_id");
            $table->unsignedBigInteger('estimate_id')->nullable();
            $table->unsignedBigInteger('labor_type_id')->nullable();
            $table->integer('hours');
            $table->decimal('cost_per_hour', 10, 2);
            $table->decimal('total_cost', 10, 2);

            $table->timestamps();

            $table->foreign('estimate_id')->references('estimate_id')->on('estimates')->onDelete('set null');
            $table->foreign('labor_type_id')->references('labor_type_id')->on('labor_types')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estimate_labors');
    }
};
