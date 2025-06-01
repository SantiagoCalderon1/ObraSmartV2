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
        Schema::create('payments', function (Blueprint $table) {
            $table->id("payment_id");
            $table->unsignedBigInteger('invoice_id')->nullable();
            $table->enum('payment_method', ['Stripe', 'Paypal', 'Efectivo'])->default('Efectivo');
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->string('transaction_id');
            $table->timestamps();

            $table->foreign('invoice_id')->references('invoice_id')->on('invoices')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
