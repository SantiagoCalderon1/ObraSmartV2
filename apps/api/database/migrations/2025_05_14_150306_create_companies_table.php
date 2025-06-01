<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id("company_id");
            $table->string('name');
            $table->string('nif')->unique();
            $table->string('phone')->unique();
            $table->string('email')->unique();
            $table->string('address');
            $table->mediumText('image_route')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
};
