<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $clients = Client::with([
            'estimates',
            'projects',
        ])->get();

        if ($clients->isEmpty()) {
            return response()->json([
                'message' => 'No clients found',
            ], 404);
        }

        //return response()->json($clients, 200);
        return response()->json([
            'message' => 'Lista de clientes',
            'data' => $clients
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
            'nif' => 'required|string|max:50|unique:clients,nif',
            'phone' => 'nullable|string|max:20',
            'email' => 'required|email|max:255|unique:clients,email',
            'address' => 'required|string|max:255|unique:clients,address',
        ]);

        $client = Client::create($validated);

        return response()->json([
            'message' => 'Cliente creado correctamente.',
            'data' => $client,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        // Así cargamos las relaciones directamente si tener que hacer mas consultas
        $client->load(['estimates', 'projects']);

        return response()->json([
            'message' => 'Cliente obtenido correctamente',
            'data' => $client,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // darle un formato bonito al JSON
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nif' => 'required|string|max:50|unique:clients,nif,' . $client->client_id . ',client_id',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $client->update($validated);

        return response()->json([
            'message' => 'Cliente actualizado correctamente',
            'data' => $client
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $client->delete();

        return response()->json(['message' => 'Cliente eliminado con éxito.']);
    }
}
