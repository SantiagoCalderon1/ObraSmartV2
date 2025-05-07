<?php

namespace App\Providers;

use App\Models\Client;
use App\Models\Estimate;
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

        // Bind personalizado: buscar Estimate por ID o estimate_number
        Route::bind('client', function ($value) {
            return Client::where('client_id', $value)
                ->orWhere('nif', $value)
                ->firstOrFail();
        });
    }
}
