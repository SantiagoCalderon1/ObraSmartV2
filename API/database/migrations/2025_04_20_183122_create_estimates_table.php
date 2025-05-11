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
        Schema::create('estimates', function (Blueprint $table) {
            $table->id("estimate_id");
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('estimate_number')->unique();
            $table->unsignedBigInteger('project_id')->nullable();
            $table->unsignedBigInteger('client_id')->nullable();
            $table->date('issue_date');
            $table->date('due_date');
            $table->enum('status', ['Aceptado', 'Pendiente', 'Rechazado'])->default('Pendiente');


            $table->decimal('discount', 10, 2)->nullable();
            $table->integer('iva');
            $table->decimal('total_cost', 10, 2);
            $table->text('conditions')->nullable();


            $table->timestamps();

            $table->foreign('project_id')->references('project_id')->on('projects')->onDelete('set null');
            $table->foreign('user_id')->references('user_id')->on('users')->onDelete('set null');
            $table->foreign('client_id')->references('client_id')->on('clients')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('estimates');
    }
};
