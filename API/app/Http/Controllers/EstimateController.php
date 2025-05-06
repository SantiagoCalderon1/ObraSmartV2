<?php

namespace App\Http\Controllers;

use App\Models\Estimate;
use App\Models\EstimateLabor;
use App\Models\EstimateMaterial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EstimateController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //$estimates = Estimate::all();
        $estimates = Estimate::with([
            'materials.material',
            'labors.laborType',
            'client',
            'project',
            'user',
            'invoice',
        ])->get();


        if ($estimates->isEmpty()) {
            return response()->json([
                'message' => 'No estimates found',
            ], 404);
        }

        //return response()->json($estimates, 200);
        return response()->json([
            'message' => 'Lista de presupuestos',
            'data' => $estimates
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
            DB::beginTransaction();

            $data = $request->all();
            $header = $data['header'] ?? [];
            $estimateMaterials = $data['estimate_materials'] ?? [];
            $estimateLabors = $data['estimate_labors'] ?? [];
            $footer = $data['footer'] ?? [];

            // Validaciones
            $headerValidator = Validator::make($header, $this->headerRules());
            $footerValidator = Validator::make($footer, $this->footerRules());

            if ($headerValidator->fails() || $footerValidator->fails()) {
                return response()->json([
                    'message' => 'Error al crear el presupuesto, datos inválidos.',
                    'errors' => $headerValidator->errors()->merge($footerValidator->errors()),
                ], 400);
            }

            // Crear Estimate
            $estimate = Estimate::create([
                'user_id'        => Auth::id(),
                'estimate_number' => $header['estimate_number'],
                'project_id'     => $header['project_id'],
                'client_id'      => $header['client_id'],
                'issue_date'     => $header['issue_date'],
                'due_date'       => $header['due_date'],
                'status'         => $header['status'],
                'iva'            => $footer['iva'],
                'total_cost'     => $footer['total_cost'],
                'conditions'     => $footer['conditions'] ?? $header['conditions'] ?? null,
            ]);

            // Insertar materiales
            $materialErrors = $this->validateItems($estimateMaterials, $this->materialRules());
            if ($materialErrors) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Error en los materiales del presupuesto.',
                    'errors' => $materialErrors,
                ], 400);
            }

            foreach ($estimateMaterials as $item) {
                $estimate->materials()->create([
                    'material_id' => $item['material_id'],
                    'quantity'    => $item['quantity'],
                    'unit_price'  => $item['unit_price'],
                    'total_price' => $item['total_price'],
                ]);
            }

            // Insertar labores
            $laborErrors = $this->validateItems($estimateLabors, $this->laborRules());
            if ($laborErrors) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Error en las labores del presupuesto.',
                    'errors' => $laborErrors,
                ], 400);
            }

            foreach ($estimateLabors as $item) {
                $estimate->labors()->create([
                    'labor_type_id'  => $item['labor_type_id'],
                    'hours'          => $item['hours'],
                    'cost_per_hour'  => $item['cost_per_hour'],
                    'total_cost'     => $item['total_cost'],
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Presupuesto creado correctamente.',
                'data' => $estimate->load(['materials', 'labors']), // Aqui esta la clave de todo los datos
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error interno del servidor al crear el presupuesto.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource. 
     * estoy implementando el Route Model Binding, que es crear la instancia automaticamente por la URL,
     * laravel lo maneja internamente
     * Route::get('/estimates/{estimate}', [EstimateController::class, 'show']);
     */
    public function show(Estimate $estimate)
    {
        // Así cargamos las relaciones directamente si tener que hacer mas consultas
        $estimate->load(['materials.material', 'labors.laborType', 'client', 'project']);


        return response()->json([
            'message' => 'Presupuesto obtenido correctamente',
            'data' => $estimate,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE); // darle un formato bonito al JSON
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Estimate $estimate)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Estimate $estimate)
    {
        try {
            DB::beginTransaction();

            $data = $request->all();

            $header = $data['header'] ?? [];
            $footer = $data['footer'] ?? [];
            $estimateMaterials = $data['estimate_materials'] ?? [];
            $estimateLabors = $data['estimate_labors'] ?? [];

            $headerValidator = Validator::make($header, $this->headerRules());
            $footerValidator = Validator::make($footer, $this->footerRules());

            if ($headerValidator->fails() || $footerValidator->fails()) {
                return response()->json([
                    'message' => 'Datos inválidos',
                    'errors' => $headerValidator->errors()->merge($footerValidator->errors()),
                ], 422);
            }

            // Validar materiales y mano de obra
            $materialErrors = $this->validateItems($estimateMaterials, $this->materialRules());
            $laborErrors = $this->validateItems($estimateLabors, $this->laborRules());

            if ($materialErrors || $laborErrors) {
                return response()->json([
                    'message' => 'Datos inválidos en materiales o mano de obra',
                    'errors' => $materialErrors->merge($laborErrors),
                ], 422);
            }

            // Actualizar cabecera del presupuesto
            $estimate->update([
                'estimate_number' => $header['estimate_number'],
                'client_id'       => $header['client_id'],
                'project_id'      => $header['project_id'],
                'status'          => $header['status'],
                'issue_date'      => $header['issue_date'],
                'due_date'        => $header['due_date'],
                'discount'        => $footer['discount'] ?? null,
                'iva'             => $footer['iva'],
                'total_cost'      => $footer['total_cost'],
                'conditions'      => $footer['conditions'] ?? null,
            ]);

            // Actualizar o crear materiales
            foreach ($estimateMaterials as $item) {
                EstimateMaterial::updateOrCreate(
                    [
                        'estimate_id' => $estimate->estimate_id,
                        'material_id' => $item['material_id']
                    ],
                    [
                        'quantity'    => $item['quantity'],
                        'unit_price'  => $item['unit_price'],
                        'total_price' => $item['total_price'] ?? $item['quantity'] * $item['unit_price'],
                    ]
                );
            }

            // Eliminar materiales que ya no están en el request
            $materialIdsInRequest = array_column($estimateMaterials, 'material_id');
            EstimateMaterial::where('estimate_id', $estimate->estimate_id)
                ->whereNotIn('material_id', $materialIdsInRequest)
                ->delete();

            // Actualizar o crear mano de obra
            foreach ($estimateLabors as $item) {
                EstimateLabor::updateOrCreate(
                    [
                        'estimate_id' => $estimate->estimate_id,
                        'labor_type_id' => $item['labor_type_id']
                    ],
                    [
                        'hours'         => $item['hours'],
                        'cost_per_hour' => $item['cost_per_hour'],
                        'total_cost'    => $item['total_cost'] ?? $item['hours'] * $item['cost_per_hour'],
                    ]
                );
            }

            // Eliminar labores que ya no están en el request
            $laborIdsInRequest = array_column($estimateLabors, 'labor_type_id');
            EstimateLabor::where('estimate_id', $estimate->estimate_id)
                ->whereNotIn('labor_type_id', $laborIdsInRequest)
                ->delete();

            DB::commit();

            return response()->json([
                'message' => 'Presupuesto actualizado correctamente',
                'data' => $estimate->fresh()->load([
                    'materials.material',
                    'labors.laborType',
                    'client',
                    'project',
                    'user'
                ]),
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el presupuesto',
                'error' => $e->getMessage(),
            ], 500);
        }
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Estimate $estimate)
    {
        DB::beginTransaction();

        try {
            // Eliminar las relaciones asociadas (materiales, labores)
            $estimate->materials()->delete();
            $estimate->labors()->delete();

            // Eliminar la estimación  
            $estimate->delete();

            DB::commit();
            return response()->json([
                'message' => 'Presupuesto eliminado correctamente.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Hubo un error al eliminar el presupuesto.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Funciones Auxiliares
    private function headerRules(): array
    {
        return [
            'estimate_number' => 'required|string|unique:estimates,estimate_number',
            'client_id'       => 'nullable|exists:projects,project_id',
            'project_id'      => 'nullable|exists:projects,project_id',
            'status'          => 'nullable|in:aceptado,pendiente,rechazado',
            'issue_date'      => 'required|date',
            'due_date'        => 'required|date|after_or_equal:issue_date',
        ];
    }

    private function footerRules(): array
    {
        return [
            'discount'    => 'nullable|numeric|min:0',
            'iva'         => 'required|numeric|min:0',
            'total_cost'  => 'required|numeric|min:0',
            'conditions'  => 'nullable|string',
        ];
    }

    private function materialRules(): array
    {
        return [
            'material_id' => 'required|exists:materials,material_id',
            'quantity'    => 'required|numeric|min:0',
            'unit_price'  => 'required|numeric|min:0',
            'total_price' => 'nullable|numeric|min:0',
        ];
    }

    private function laborRules(): array
    {
        return [
            'labor_type_id' => 'required|exists:labor_types,labor_type_id',
            'hours'         => 'required|numeric|min:0',
            'cost_per_hour' => 'required|numeric|min:0',
            'total_cost'    => 'nullable|numeric|min:0',
        ];
    }

    private function validateItems(array $items, array $rules)
    {
        foreach ($items as $item) {
            $validator = Validator::make($item, $rules);
            if ($validator->fails()) {
                return $validator->errors();
            }
        }
        return null;
    }
}
