<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InvoicesController
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //$invoices = Invoice::all();
        $invoices = Invoice::with([
            'estimate.materials.material',
            'estimate.labors.laborType',
            'estimate.client',
            'estimate.project',
            'estimate.user',
            'payments',
        ])->get();


        if ($invoices->isEmpty()) {
            return response()->json([
                'message' => 'No invoices found',
            ], 404);
        }

        //return response()->json($invoices, 200);
        return response()->json([
            'message' => 'Lista de facturas',
            'data' => $invoices
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

        $invoiceData = $request->all() ?? [];

        $invoiceValidator = Validator::make($invoiceData, $this->invoiceRules());

        if ($invoiceValidator->fails()) {
            return response()->json([
                'message' => 'Error al crear la factura, datos inválidos.',
                'errors' => $invoiceValidator->errors(),
            ], 400);
        }

        // Crear factura
        $invoice = Invoice::create([
            'invoice_number' => 'INV-' . date('ymdHis'),
            'estimate_id'    => $invoiceData['estimate_id'],
            'issue_date'     => $invoiceData['issue_date'],
            'due_date'       => $invoiceData['due_date'],
            'total_amount'   => $invoiceData['total_amount'],
            'status'         => "Pendiente",
            'pdf_url'        => $invoiceData['pdf_url'] ?? null,
        ]);


        return response()->json([
            'message' => 'Factura creada correctamente.',
            'data' => $invoice->fresh()->load([
                'estimate.materials.material',
                'estimate.labors.laborType',
                'estimate.client',
                'estimate.project',
                'estimate.user',
            ]),
        ], 201);
    }


    /**
     * Display the specified resource. 
     * estoy implementando el Route Model Binding, que es crear la instancia automaticamente por la URL,
     * laravel lo maneja internamente
     * Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
     */
    public function show(Invoice $invoice)
    {
        // Cargar relaciones si las hay. Aquí sólo tienes estimate y payments según tu modelo.
        $invoice->load(['estimate', 'payments']);

        return response()->json([
            'message' => 'Factura obtenida correctamente',
            'data'    => $invoice,
        ], 200, [], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Invoice $invoice)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     * 
     * El método lo creé pero es muy peligroso e incluso ilegal, lo mejor es no usarlo.
     * Esta creado para casos excepcionales
     */
    public function update(Request $request, Invoice $invoice)
    {
        try {
            DB::beginTransaction();

            $data = $request->all();

            $invoice = $data['invoice'] ?? [];

            // Validaciones
            $InvoiceDataValidator = Validator::make($invoice, $this->invoiceRules());

            if ($InvoiceDataValidator->fails()) {
                return response()->json([
                    'message' => 'Error al crear el presupuesto, datos inválidos.',
                    'errors' => $InvoiceDataValidator->errors(),
                ], 400);
            }

            // Actualizar cabecera del presupuesto
            $invoice->update([
                'user_id'        => Auth::id(),
                'client_id'      => $invoice['client_id'],
                'project_id'     => $invoice['project_id'],
                'issue_date'     => $invoice['issue_date'],
                'due_date'       => $invoice['due_date'],
                'status'         => $invoice['status'],
                'iva'            => $invoice['iva'],
                'total_cost'     => $invoice['total_cost'],
                'conditions'     => $invoice['conditions'] ?? null,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Presupuesto actualizado correctamente',
                'data' => $invoice->fresh()->load([
                    'estimate',
                    'payments',
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
     * Remove the specified invoice from storage.
     */
    public function destroy(Invoice $invoice)
    {
        DB::beginTransaction();

        try {
            $invoice->payments()->delete(); // Si las facturas tienen pagos asociados

            // Eliminar la factura
            $invoice->delete();

            DB::commit();
            return response()->json([
                'message' => 'Factura eliminada correctamente.'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Hubo un error al eliminar la factura.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    // Funciones Auxiliares
    protected function invoiceRules()
    {
        return [
            'estimate_id'   => 'required|exists:estimates,estimate_id',
            'issue_date'    => 'required|date',
            'due_date'      => 'required|date|after_or_equal:issue_date',
            'total_amount'  => 'required|numeric|min:0',
            'pdf_url'       => 'nullable|string',
        ];
    }
}
