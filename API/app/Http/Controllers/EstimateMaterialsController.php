<?php

namespace App\Http\Controllers;

use App\Models\EstimateMaterial;
use Illuminate\Http\Request;

class EstimateMaterialsController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    }

    /**
     * Display the specified resource.
     */
    public function show(EstimateMaterial $estimateMaterial)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(EstimateMaterial $estimateMaterial)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, EstimateMaterial $estimateMaterial)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(EstimateMaterial $estimateMaterial)
    {
        //
    }
}
