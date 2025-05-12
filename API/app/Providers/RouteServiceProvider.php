<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Estimate;
use App\Models\Invoice;
use App\Models\Project;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Bind personalizado: buscar Estimate por ID o estimate_number
        Route::bind('estimate', function ($value) {
            return Estimate::where('estimate_id', $value)
                ->orWhere('estimate_number', $value)
                ->firstOrFail();
        });

        // Bind personalizado: buscar Client por ID o nif
        Route::bind('client', function ($value) {
            return Client::where('client_id', $value)
                ->orWhere('nif', $value)
                ->firstOrFail();
        });

         // Bind personalizado: buscar Project por ID o name
        Route::bind('project', function ($value) {
            return Project::where('project_id', $value)
                ->orWhere('name', $value)
                ->firstOrFail();
        });

         // Bind personalizado: buscar Invoice por ID o invoice_number
        Route::bind('invoice', function ($value) {
            return Invoice::where('invoice_id', $value)
                ->orWhere('invoice_number', $value)
                ->firstOrFail();
        });
    }
}
