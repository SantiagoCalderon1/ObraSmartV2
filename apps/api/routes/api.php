<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\EstimateController;
use App\Http\Controllers\InvoicesController;
use App\Http\Controllers\LaborTypesController;
use App\Http\Controllers\MaterialsController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\StockMovementsController;
use App\Http\Controllers\UsersController;
use App\Http\Middleware\IsAdminAuth;
use App\Http\Middleware\IsUserAuth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


//PUBLIC ROUTE
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

//PRIVATE ROUTE
Route::middleware([IsUserAuth::class])->group(function () {

    //Rutas del AuthController
    Route::controller(AuthController::class)->group(function () {
        Route::post('logout', 'logout');
        Route::get('me', 'getUser');
    }); //Rutas de UsersController
    Route::controller(UsersController::class)->group(function () {
        Route::get('/user', 'index');
        Route::post('/user', 'store');
        Route::get('/user/{user}', 'show');
        Route::patch('/user/reset-password', 'updatePassword');
        Route::patch('/user/{user}', 'update');
        Route::delete('/user/{user}', 'destroy');
    });



    //Rutas de EstimateController
    Route::controller(EstimateController::class)->group(function () {
        Route::get('/estimates', 'index');
        Route::post('/estimates', 'store');
        Route::get('/estimates/{estimate}', 'show');
        Route::put('/estimates/{estimate}', 'update');
        Route::patch('/estimates/{estimate}', 'update');
        Route::delete('/estimates/{estimate}', 'destroy');
    });

    //Rutas de ClientController
    Route::controller(ClientController::class)->group(function () {
        Route::get('/clients', 'index');
        Route::get('/clients/{client}', 'show');
        Route::post('/clients', 'store');
        Route::put('/clients/{client}', 'update');
        Route::patch('/clients/{client}', 'update');
        Route::delete('/clients/{client}', 'destroy');
    });

    //Rutas de ProjectController
    Route::controller(ProjectController::class)->group(function () {
        Route::get('/projects', 'index');
        Route::get('/projects/{project}', 'show');
        Route::post('/projects', 'store');
        Route::put('/projects/{project}', 'update');
        Route::patch('/projects/{project}', 'update');
        Route::delete('/projects/{project}', 'destroy');
    });

    //Rutas de MaterialController
    Route::controller(MaterialsController::class)->group(function () {
        Route::get('/materials', 'index');
        Route::get('/materials/{material}', 'show');
        Route::post('/materials', 'store');
        Route::put('/materials/{material}', 'update');
        Route::patch('/materials/{material}', 'update');
        Route::delete('/materials/{material}', 'destroy');
    });

    // Rutas de StockMovementsController
    Route::controller(StockMovementsController::class)->group(function () {
        Route::get('/stock-movements', 'index');
        Route::get('/stock-movements/{stockMovement}', 'show');
        Route::post('/stock-movements', 'store');
        Route::put('/stock-movements/{stockMovement}', 'update');
        Route::patch('/stock-movements/{stockMovement}', 'update');
        Route::delete('/stock-movements/{stockMovement}', 'destroy');
    });


    //Rutas de LaborTypesController
    Route::controller(LaborTypesController::class)->group(function () {
        Route::get('/labor-types', 'index');
        Route::get('/labor-types/{laborType}', 'show');
        Route::post('/labor-types', 'store');
        Route::put('/labor-types/{laborType}', 'update');
        Route::patch('/labor-types/{laborType}', 'update');
        Route::delete('/labor-types/{laborType}', 'destroy');
    });

    //Rutas de InvoicesController
    Route::controller(InvoicesController::class)->group(function () {
        Route::get('/invoices', 'index');
        Route::post('/invoices', 'store');
        Route::get('/invoices/{invoice}', 'show');
        Route::put('/invoices/{invoice}', 'update');
        Route::patch('/invoices/{invoice}', 'update');
        Route::delete('/invoices/{invoice}', 'destroy');
    });

    // A estas rutas solo podrá acceder el Administrador
    Route::middleware([IsAdminAuth::class])->group(function () {
        //Rutas de CompanyController
        Route::controller(CompanyController::class)->group(function () {
            Route::get('/companies', 'index');
            Route::post('/companies', 'store');
            Route::get('/companies/{company}', 'show');
            Route::patch('/companies/{company}', 'update');
            Route::post('/companies-logo/{company}', 'updateLogo');
            Route::delete('/companies/{company}', 'destroy');
        });
    });
});
