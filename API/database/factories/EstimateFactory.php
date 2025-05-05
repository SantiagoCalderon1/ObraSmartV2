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
        return [
            'client_id'     => Client::inRandomOrder()->value('client_id'),
            'project_id'    => Project::inRandomOrder()->value('project_id'),
            'user_id'       => User::inRandomOrder()->value('user_id'),
            'estimate_number' => fake()->unique()->numerify('EST-#####'),
            'iva' => fake()->randomElement([0, 10, 21]),
            'total_cost' => fake()->randomFloat(2, 100, 5000),
            'status' => fake()->randomElement(['aceptado', 'pendiente', 'rechazado']),
            'issue_date' => fake()->date(),
            'due_date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'conditions' => fake()->paragraph(2),
        ];
    }
}
