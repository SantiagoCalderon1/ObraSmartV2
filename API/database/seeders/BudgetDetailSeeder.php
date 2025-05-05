<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\BudgetDetail;

class BudgetDetailSeeder extends Seeder
{
    protected $model = BudgetDetail::class;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BudgetDetail::factory()->count(10)->create();
    }
}
