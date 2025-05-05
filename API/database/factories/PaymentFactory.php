<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payments>
 */
class PaymentFactory extends Factory
{

    protected $model = Payment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_id' => Invoice::inRandomOrder()->value('invoice_id'),
            'payment_method' => fake()->randomElement(['Stripe', 'Paypal', 'Efectivo']),
            'amount' => fake()->randomFloat(2, 10, 1000),
            'payment_date' => fake()->date(),
            'transaction_id' => fake()->uuid(),
        ];
    }
}
