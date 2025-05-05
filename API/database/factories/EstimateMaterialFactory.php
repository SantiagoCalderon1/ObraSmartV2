<?php

namespace Database\Factories;

use App\Models\Estimate;
use App\Models\EstimateMaterial;
use App\Models\Material;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Estimate_materials>
 */
class EstimateMaterialFactory extends Factory
{

    protected $model = EstimateMaterial::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $quantity = fake()->numberBetween(1, 50);
        $unitPrice = fake()->randomFloat(2, 1, 100);

        return [
            'estimate_id' => Estimate::inRandomOrder()->value('estimate_id'),
            'material_id' => Material::inRandomOrder()->value('material_id'),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'total_price' => $quantity * $unitPrice,
        ];
    }
}
