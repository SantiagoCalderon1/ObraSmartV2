<?php

namespace App\Http\Controllers;

use App\Models\LaborType;
use Illuminate\Http\Request;

class LaborTypesController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $laborTypes = LaborType::with([
            'estimateLabors'
        ])->get();

        if ($laborTypes->isEmpty()) {
            return response()->json([
                'message' => 'No labor types found',
            ], 404);
        }

        //return response()->json($clients, 200);
        return response()->json([
            'message' => 'Lista de servicios',
            'data' => $laborTypes
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
            'cost_per_hour' => 'requiered|numeric|min:0'
        ]);

        $laborType = LaborType::create($validated);

        return response()->json([
            'message' => 'LaborType creado correctamente.',
            'data' => $laborType,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(LaborType $laborType)
    {
        // Así cargamos las relaciones directamente si tener que hacer mas consultas
        $laborType->load(['estimate_labor']);

        return response()->json([
            'message' => 'Labor type obtenido correctamente',
            'data' => $laborType,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // darle un formato bonito al JSON
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LaborType $laborType)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LaborType $laborType)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'cost_per_hour' => 'requiered|numeric|min:0'
        ]);

        $laborType->update($validated);

        return response()->json([
            'message' => 'Labor type actualizado correctamente',
            'data' => $laborType
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LaborType $laborType)
    {
        $laborType->delete();

        return response()->json(['message' => 'Labor type eliminado con éxito.']);
    }
}
