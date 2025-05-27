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
        // Generar una fecha aleatoria entre hoy y hace 5 meses
        $issueDate = fake()->dateTimeBetween('-5 months', 'now');

        return [
            'invoice_number' => fake()->unique()->numerify('INV-#####'),
            'estimate_id' => Estimate::inRandomOrder()->value('estimate_id'),
            'issue_date' => $issueDate->format('Y-m-d'),
            'due_date' => $issueDate->modify('+6 months')->format('Y-m-d'),
            'total_amount' => fake()->randomFloat(2, 100, 5000),
            'status' => fake()->randomElement(['pagado', 'pendiente', 'rechazado']),
            'pdf_url' => "",
        ];
    }
}
