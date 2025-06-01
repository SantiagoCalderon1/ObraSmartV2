<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use PhpParser\Node\Stmt\TryCatch;

class CompanyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $companies = Company::all();

        if ($companies->isEmpty()) {
            return response()->json([
                'message' => 'No companies found',
            ], 404);
        }

        /* foreach ($companies as $company) {
            $company->image_route = asset('storage/' . $company->image_route);
        } */

        //return response()->json($clients, 200);
        return response()->json([
            'message' => 'Lista de compañias',
            'data' => $companies
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
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'nif' => 'required|string|unique:companies,nif',
                'phone' => 'required|string|unique:companies,phone',
                'email' => 'required|email|unique:companies,email',
                'address' => 'required|string',
                'image_route' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            ]);

            $rutaImg = $request->file('image_route')->store('uploads');
            $validated['image_route'] = $rutaImg;

            $company = Company::create($validated);
            // Si tiene imagen, genera la URL accesible
            /*  if ($company->image_route) {
                $company->image_route = asset('storage/' . $company->image_route);
            } */
            return response()->json([
                'message' => 'Compañía creada correctamente.',
                'data' => $company,
            ], 201);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 422);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Company $company)
    {
        /*         $company->image_route = asset(Storage::url($company->image_route));
 */
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
        ]);

        $company->update($validated);

        return response()->json([
            'message' => 'Datos de la compañía actualizados correctamente.',
            'data' => $company,
        ], 200);
    }

    public function updateLogo(Request $request, Company $company)
    {
        try {
            $validated = $request->validate([
                'image_route' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:4096',
            ]);

            $rutaImg = '';

            if ($request->hasFile('image_route')) {
                // Eliminar imagen anterior si existe
                if ($company->image_route && Storage::exists($company->image_route)) {
                    Storage::delete($company->image_route);
                }

                // Subir nueva imagen
                $rutaImg = $request->file('image_route')->store('uploads');
                $validated['image_route'] = $rutaImg;
            }

            $company->update($validated);
            $company->refresh();

            /* if ($company->image_route) {
                $company->image_route = asset('storage/' . $company->image_route);
            } */

            return response()->json([
                'message' => 'Imagen de la compañía actualizada correctamente.',
                'data' => $company
            ], 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => $th->getMessage()], 422);
        }
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
