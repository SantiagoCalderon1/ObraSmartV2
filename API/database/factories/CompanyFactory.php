<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Company>
 */
class CompanyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company,
            'nif' => $this->faker->unique()->bothify('??########'),
            'phone' => $this->faker->phoneNumber,
            'email' => $this->faker->unique()->companyEmail,
            'address' => $this->faker->address,
            'url_logo' => $this->faker->imageUrl(200, 200, 'business', true, 'Logo'),
        ];
    }
}
