<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\EstimateController;
use App\Http\Controllers\LaborTypesController;
use App\Http\Controllers\MaterialsController;
use App\Http\Controllers\ProjectController;

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
        Route::get('/materials/{materials}', 'show');
        Route::post('/materials', 'store');
        Route::put('/materials/{materials}', 'update');
        Route::patch('/materials/{materials}', 'update');
        Route::delete('/materials/{materials}', 'destroy');
    });

    //Rutas de ProjectController
    Route::controller(LaborTypesController::class)->group(function () {
        Route::get('/labor-types', 'index');
        Route::get('/labor-types/{laborType}', 'show');
        Route::post('/labor-types', 'store');
        Route::put('/labor-types/{laborType}', 'update');
        Route::patch('/labor-types/{laborType}', 'update');
        Route::delete('/labor-types/{laborType}', 'destroy');
    });

    /*  // Aqui van las rutas que pueden acceder bien sea Admin o User

    Route::get('/budgets', [BudgetController::class, 'getBudgets']);

    // A estas rutas solo podrá acceder el Administrador
    Route::middleware([IsAdminAuth::class])->group(function () {

        //Rutas del AuthController
        Route::controller(BudgetController::class)->group(function () {
            //Rutas aqui de los que pueda hacer solo el Admin
            Route::post('budgets', 'addBudget');
            Route::get('/budget/{id}', 'getBudgetById');
            Route::patch('/budgets/{id}', 'updateBudgetById');
            Route::post('/budgets/{id}', 'deleteBudgetById');
        });
    }); 
    */
});
