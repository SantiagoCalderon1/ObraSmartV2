<?php

namespace Database\Factories;

use App\Models\Estimate;
use App\Models\LaborType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Labor_type>
 */
class LaborTypeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->jobTitle(),
            'cost_per_hour' => fake()->randomFloat(2, 10, 60),
        ];
    }
}
