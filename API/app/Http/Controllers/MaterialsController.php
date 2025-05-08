<?php

namespace App\Http\Controllers;

use App\Models\Material;
use Illuminate\Http\Request;

class MaterialsController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $materials = Material::with([
            'estimateMaterials',
            'stockMovements',
        ])->get();

        if ($materials->isEmpty()) {
            return response()->json([
                'message' => 'No materials found',
            ], 404);
        }

        //return response()->json($clients, 200);
        return response()->json([
            'message' => 'Lista de materiales',
            'data' => $materials
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
            'unit' => 'required|in:kg,m2,lt,unidades',
            'price_per_unit' => 'requiered|numeric|min:0',
            'stock_quantity' => 'nullable|numeric|min:0',
            'min_stock_alert' => 'nullable|min:0',
        ]);

        $material = Material::create($validated);

        return response()->json([
            'message' => 'Material creado correctamente.',
            'data' => $material,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Material $material)
    {
        // Así cargamos las relaciones directamente si tener que hacer mas consultas
        $material->load(['estimates_materials', 'stock_movements']);

        return response()->json([
            'message' => 'Materiales obtenido correctamente',
            'data' => $material,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // darle un formato bonito al JSON
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Material $material)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'unit' => 'required|in:kg,m2,lt,unidades',
            'price_per_unit' => 'requiered|numeric|min:0',
            'stock_quantity' => 'nullable|numeric|min:0',
            'min_stock_alert' => 'nullable|min:0',
        ]);

        $material->update($validated);

        return response()->json([
            'message' => 'Material actualizado correctamente',
            'data' => $material
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Material $material)
    {
        $material->delete();

        return response()->json(['message' => 'Material eliminado con éxito.']);
    }
}
