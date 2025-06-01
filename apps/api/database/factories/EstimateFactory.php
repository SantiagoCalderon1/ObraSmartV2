<?php

namespace Database\Factories;

use App\Models\Estimate;
use App\Models\Client;
use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class EstimateFactory extends Factory
{
    protected $model = Estimate::class;

    public function definition(): array
    {
        // Generar una fecha aleatoria entre hoy y hace 5 meses
        $issueDate = fake()->dateTimeBetween('-5 months', 'now');
        return [
            'client_id'     => Client::inRandomOrder()->value('client_id'),
            'project_id'    => Project::inRandomOrder()->value('project_id'),
            'user_id'       => User::inRandomOrder()->value('user_id'),
            'estimate_number' => fake()->unique()->numerify('EST-#####'),
            'iva' => fake()->randomElement([0, 10, 21]),
            'total_cost' => fake()->randomFloat(2, 100, 5000),
            'status' => fake()->randomElement(['aceptado', 'pendiente', 'rechazado']),
            'issue_date' => $issueDate->format('Y-m-d'),
            'due_date' => $issueDate->modify('+6 months')->format('Y-m-d'),
            'conditions' => fake()->paragraph(3),
        ];
    }
}
