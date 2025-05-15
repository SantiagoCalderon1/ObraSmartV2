<?php

namespace Database\Factories;

use App\Models\Invoice;
use App\Models\Estimate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Invoices>
 */
class InvoiceFactory extends Factory
{
    protected $model = Invoice::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'invoice_number' => fake()->unique()->numerify('INV-#####'),
            'estimate_id' => Estimate::inRandomOrder()->value('estimate_id'),
            'issue_date' => fake()->date(),
            'due_date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'total_amount' => fake()->randomFloat(2, 100, 5000),
            'status' => fake()->randomElement(['pagado', 'pendiente', 'rechazado']),
            'pdf_url' => fake()->optional()->url(),
        ];
    }
}
