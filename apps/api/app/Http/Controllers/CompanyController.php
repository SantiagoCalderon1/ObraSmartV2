<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;


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
            'image_route' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image_route')) {
            $image = $request->file('image_route');
            $filename = 'logo-' . time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('uploads'), $filename);
            $validated['image_route'] = 'uploads/' . $filename;
        }

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
            'name' => 'sometimes|required|string|max:255',
            'nif' => 'sometimes|required|string|unique:companies,nif,' . $company->company_id . ',company_id',
            'phone' => 'sometimes|required|string|unique:companies,phone,' . $company->company_id . ',company_id',
            'email' => 'sometimes|required|email|unique:companies,email,' . $company->company_id . ',company_id',
            'address' => 'sometimes|required|string',
            'image_route' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
        ]);

        if ($request->hasFile('image_route')) {
            // Eliminar la imagen anterior si existe
            if ($company->image_route) {
                $previousFilename = basename($company->image_route);
                $previousPath = public_path('uploads/' . $previousFilename);
                if (file_exists($previousPath)) {
                    unlink($previousPath);
                }
            }

            // Subir nueva imagen
            $image = $request->file('image_route');
            $filename = 'logo-' . time() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('uploads'), $filename);
            $validated['image_route'] = url('uploads/' . $filename); // genera URL completa accesible
        }

        $company->update($validated);

        return response()->json([
            'message' => 'Compañía actualizada correctamente.',
            'data' => $company,
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
