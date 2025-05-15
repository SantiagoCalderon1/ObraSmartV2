<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $projects = Project::with([
            'estimates',
            'projectLogs',
            'stockMovements',
            'client',
        ])->get();

        if ($projects->isEmpty()) {
            return response()->json([
                'message' => 'No projects found',
            ], 404);
        }

        //return response()->json($clients, 200);
        return response()->json([
            'message' => 'Lista de proyectos',
            'data' => $projects
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
            'client_id'     => 'required|string|max:255',
            'name'          => 'required|string|max:255',
            'description'   => 'required|string',
            'status'        => 'required|in:en proceso,completado,cancelado',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date',
        ]);

        $project = Project::create($validated);

        return response()->json([
            'message' => 'Proyecto creado correctamente.',
            'data' => $project,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(Project $project)
    {
        // Así cargamos las relaciones directamente si tener que hacer mas consultas
        $project->load(['estimates', 'projectLogs', 'stockMovements', 'client']);

        return response()->json([
            'message' => 'Proyecto obtenido correctamente',
            'data' => $project,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // darle un formato bonito al JSON
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Project $project)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'client_id'     => 'required',
            'name'          => 'required|string|max:255',
            'description'   => 'required|string',
            'status'        => 'required|in:en proceso,completado,cancelado',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date',
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Proyecto actualizado correctamente',
            'data' => $project
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Project $project)
    {
        $project->delete();

        return response()->json(['message' => 'Proyecto eliminado con éxito.']);
    }
}
