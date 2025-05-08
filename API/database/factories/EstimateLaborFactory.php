<?php

namespace Database\Factories;

use App\Models\Estimate;
use App\Models\LaborType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\estimate_labor>
 */
class EstimateLaborFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $hours = fake()->numberBetween(1, 20);
        $costPerHour = fake()->randomFloat(2, 10, 60);
        $discount = fake()->randomFloat(2, 100, 5000);

        return [
            'estimate_id' => Estimate::inRandomOrder()->value('estimate_id'),
            'labor_type_id' => LaborType::inRandomOrder()->value('labor_type_id'),
            'hours' => $hours,
            'cost_per_hour' => $costPerHour,
            'discount' => $discount,
            'total_cost' => (($hours * $costPerHour) - $discount),
            'description' => fake()->paragraph(2),
        ];
    }
}
