<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Budget;


class BudgetSeeder extends Seeder
{
    protected $model = Budget::class;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Budget::factory()->count(10)->create();
    }
}
