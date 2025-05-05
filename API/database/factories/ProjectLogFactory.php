<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project_logs>
 */
class ProjectLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'log_type' => fake()->randomElement(['presupuesto', 'factura', 'material', 'comentario']),
            'project_id' => Project::inRandomOrder()->value('project_id'),
        ];
    }
}
