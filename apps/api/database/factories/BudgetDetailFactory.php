<?php

namespace Database\Factories;

use App\Models\Budget;
use App\Models\BudgetDetail;
use App\Models\Invoice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\BudgetDetail>
 */
class BudgetDetailFactory extends Factory
{
    protected $model = BudgetDetail::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'budget_id' => Budget::inRandomOrder()->value('budget_id'), 
            'concept' => $this->faker->word(),
            'quantity' => $this->faker->numberBetween(1, 100),
            'discount' => $this->faker->randomFloat(2, 0, 50), 
            'unit_price' => $this->faker->randomFloat(2, 10, 500),
            'description' => $this->faker->sentence(),
            
            'subtotal' => $this->faker->randomFloat(2, 50, 1000),
        ];
    }
}
