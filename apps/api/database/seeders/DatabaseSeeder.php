<?php

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Client;
use App\Models\Company;
use App\Models\Project;
use App\Models\Estimate;
use App\Models\ProjectLog;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Material;
use App\Models\EstimateMaterial;
use App\Models\LaborType;
use App\Models\EstimateLabor;
use App\Models\StockMovement;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Crear un usuario de prueba
        User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
            'role' => 'admin',
        ]);

        User::factory()->create([
            'name' => 'Test Worker',
            'email' => 'worker@example.com',
            'role' => 'worker',
        ]);

        Company::factory()->create([
            'name' => 'ObraSmart S.A',
            'nif' => 'A12345678',
            'phone' => '987654321',
            'email' => 'obra@smart.com',
            'address' => 'Calle 123, Valencia',
            'image_route' => 'uploads/3lIh7pC9aFYNBYzFCSn6L2L6dL4cFhtjElFQl06s.png',
        ]);

        // Crear usuarios
        User::factory(5)->create();

        // Crear materiales y tipos de mano de obra primero
        Material::factory(30)->create();
        LaborType::factory(10)->create();

        // Crear clientes
        Client::factory(20)->create()->each(function ($client) {
            // Cada cliente con 1-3 proyectos
            Project::factory(rand(1, 3))
                ->for($client)
                ->create()
                ->each(function ($project) use ($client) {
                    // Cada proyecto con 1-2 estimates
                    Estimate::factory(rand(1, 2))
                        ->for($project)
                        ->for($client)
                        ->for(User::inRandomOrder()->first())
                        ->create()
                        ->each(function ($estimate) {
                            // Factura y pagos
                            $invoice = Invoice::factory()
                                ->for($estimate)
                                ->create();

                            Payment::factory(rand(1, 2))
                                ->for($invoice)
                                ->create();

                            // Materiales y mano de obra
                            EstimateMaterial::factory(rand(2, 10))
                                ->for($estimate)
                                ->create();

                            EstimateLabor::factory(rand(1, 10))
                                ->for($estimate)
                                ->create();
                        });

                    // Logs de proyecto
                    ProjectLog::factory(rand(1, 10))
                        ->for($project)
                        ->create();

                    // Movimiento de stock
                    StockMovement::factory(rand(1, 5))
                        ->for($project)
                        ->for(Material::inRandomOrder()->first())
                        ->for(User::inRandomOrder()->first())
                        ->create();
                });
        });
    }
}
