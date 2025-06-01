<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StockMovementsController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(StockMovement::with(['material', 'project', 'user'])->get());
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
            'material_id' => 'required|exists:materials,material_id',
            'project_id' => 'required|exists:projects,project_id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'required|in:compra,uso,ajuste'
        ]);

        try {
            $material = Material::findOrFail($validated['material_id']);

            // Ajustar stock del material
            if ($validated['reason'] === 'compra') {
                $material->stock_quantity += $validated['quantity'];
            } elseif ($validated['reason'] === 'uso') {
                if ($material->stock_quantity < $validated['quantity']) {
                    return response()->json(['message' => 'Stock insuficiente para registrar el uso.'], 400);
                }
                $material->stock_quantity -= $validated['quantity'];
            }

            $material->save();

            // Guardar movimiento
            $movement = StockMovement::create([
                'material_id' => $validated['material_id'],
                'project_id' => $validated['project_id'],
                'user_id'        => Auth::id(),
                'quantity' => $validated['quantity'],
                'reason' => $validated['reason']
            ]);

            return response()->json([
                'message' => 'Movimiento de stock registrado correctamente.',
                'movement' => $movement
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al registrar movimiento de stock: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error al registrar movimiento.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(StockMovement $stockMovement)
    {
        return response()->json($stockMovement);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(StockMovement $stockMovement)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, StockMovement $stockMovement)
    {
        return response()->json(['message' => 'Actualización no permitida.'], 403);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockMovement $stockMovement)
    {
        $stockMovement->delete();
        return response()->json(['message' => 'Movimiento eliminado con éxito.']);
    }
}
