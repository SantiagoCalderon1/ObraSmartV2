<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\BudgetDetailController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ProjectController;
use App\Http\Middleware\IsAdminAuth;
use App\Http\Middleware\IsUserAuth;
use App\Models\BudgetDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


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

    //Rutas de BudgetController
    Route::controller(BudgetController::class)->group(function () {
        Route::get('/budgets', 'index');
        Route::get('/budgets/{id}', 'show');
        Route::post('/budgets', 'store');
        Route::put('/budgets/{id}', 'update');
        Route::patch('/budgets/{id}', 'update');
        Route::delete('/budgets/{id}', 'destroy');
    });

    //Rutas de BudgetDetailController
    Route::controller(BudgetDetailController::class)->group(function () {
        Route::get('/budgets-details/{id?}', 'index');
        //Route::get('/budgets-details/{id}', 'show');
        //Route::post('/budgets-details', 'store');
        //Route::put('/budgets-details/{id}', 'update');
        //Route::patch('/budgets-details/{id}', 'update');
        //Route::delete('/budgets-details/{id}', 'destroy');
    });

    //Rutas de ClientController
    Route::controller(ClientController::class)->group(function () {
        Route::get('/clients', 'index');
        Route::get('/clients/{id}', 'show');
        Route::post('/clients', 'store');
        Route::put('/clients/{id}', 'update');
        Route::patch('/clients/{id}', 'update');
        Route::delete('/clients/{id}', 'destroy');
    });



    //Rutas de ProjectController
    Route::controller(ProjectController::class)->group(function () {
        Route::get('/projects', 'index');
        Route::get('/projects/{id}', 'show');
        Route::post('/projects', 'store');
        Route::put('/projects/{id}', 'update');
        Route::patch('/projects/{id}', 'update');
        Route::delete('/projects/{id}', 'destroy');
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
