<?php

namespace Database\Factories;

use App\Models\Client;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Project>
 */
class ProjectFactory extends Factory
{
    protected $model = Project::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Generar una fecha aleatoria entre hoy y hace 5 meses
        $start_date = fake()->dateTimeBetween('-6 months', 'now');
        return [
            'client_id' => Client::inRandomOrder()->value('client_id'),
            'name' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['en proceso', 'completado', 'cancelado']),
            'start_date' => $start_date->format('Y-m-d'),
            'end_date' => $start_date->modify('+6 months')->format('Y-m-d'),
        ];
    }
}
