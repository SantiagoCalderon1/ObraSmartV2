<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Materials>
 */
class MaterialFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->word(),
            'unit' => fake()->randomElement(['kg', 'm2', 'lt', 'unidades']),
            'price_per_unit' => fake()->randomFloat(2, 0.5, 100),
            'stock_quantity' => fake()->numberBetween(0, 500),
            'min_stock_alert' => fake()->numberBetween(5, 50),
        ];
    }
}
