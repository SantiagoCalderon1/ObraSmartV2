<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $company = Company::all();

        if ($company->isEmpty()) {
            return response()->json([
                'message' => 'No companies found',
            ], 404);
        }

        //return response()->json($clients, 200);
        return response()->json([
            'message' => 'Lista de compañias',
            'data' => $company
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nif' => 'required|string|unique:companies,nif',
            'phone' => 'required|string|unique:companies,phone',
            'email' => 'required|email|unique:companies,email',
            'address' => 'required|string',
            'url_logo' => 'nullable|string',
        ]);

        $company = Company::create($validated);

        return response()->json([
            'message' => 'Compañía creada correctamente.',
            'data' => $company,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {

        return response()->json([
            'message' => 'Compañía obtenida correctamente',
            'data' => $company,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // darle un formato bonito al JSON
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Company $company) {}

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nif' => 'required|string|unique:companies,nif',
            'phone' => 'required|string|unique:companies,phone',
            'email' => 'required|email|unique:companies,email',
            'address' => 'required|string',
            'url_logo' => 'nullable|string',
        ]);

        $company->update($validated);

        return response()->json([
            'message' => 'Compania actualizada correctamente',
            'data' => $company
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Company $company)
    {
        $company->delete();
        return response()->json(['message' => 'Compañia eliminada con éxito.']);
    }
}
