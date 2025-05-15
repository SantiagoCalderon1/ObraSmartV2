<?php

namespace Database\Factories;

use App\Models\Material;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\stock_movements>
 */
class StockMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'material_id' => Material::inRandomOrder()->value('material_id'),
            'project_id' => Project::inRandomOrder()->value('project_id'),
            'user_id' => User::inRandomOrder()->value('user_id'),
            'quantity' => fake()->numberBetween(-10, 50),
            'reason' => fake()->randomElement(['compra', 'uso', 'ajuste']),
        ];
    }
}
