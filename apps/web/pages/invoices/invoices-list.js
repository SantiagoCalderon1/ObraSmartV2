import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Table } from "../../components/table.js"
import { Button } from "../../components/button.js"
import { PageEstructure } from "../../components/page-estrcuture.js"
import { Card } from "../../components/card.js"
import { InvoicesResumenCard } from "../../components/card-invoices.js"
import { TableModal } from "../../components/table-modal.js"
import { SpinnerLoading } from "../../components/spinner-loading.js"

// IMPORTADOR DE FUNCIONES
import { fetchInvoices, deleteInvoice, updateInvoice } from "../../Services/services.js"
import { GeneratePDF } from "../../components/generate-pdf.js";

export function InvoicesListPage() {
    let invoices = []
    let selectedInvoice = null
    let lastUpdated = Date.now()

    async function loadInvoices() {
        invoices = (await fetchInvoices()).data
        lastUpdated = Date.now()
        console.log(invoices[0]);
        m.redraw()
    }
    return {
        oncreate: loadInvoices,
        view: function () {
            const onSelect = (invoice) => {
                selectedInvoice = invoice
                new bootstrap.Modal(document.getElementById("ModalDetailsInvoicesList")).show()
                m.redraw()
            }

            const handleInvoiceAction = async (action) => {
                if (!selectedInvoice) return
                try {
                    let response
                    switch (action) {
                        case "delete":
                            response = await deleteInvoice(selectedInvoice.invoice_id)
                            break
                        case "pay":
                            response = await updateInvoice({ status: "pagado" }, selectedInvoice.invoice_id)
                            break
                        case "rejected":
                            response = await updateInvoice({ status: "rechazado" }, selectedInvoice.invoice_id)
                            break
                    }
                    selectedInvoice = null
                    if (response) {
                        Toastify({
                            text: "¡Operación exitosa!",
                            className: "toastify-success",
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right"
                        }).showToast()
                        m.route.set("/invoices")
                    }
                } catch (error) {
                    console.error("Error al enviar el formulario:", error)
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                } finally {
                    await loadInvoices()
                    m.redraw()
                }
            }

            const columns = [
                { title: "#", field: "index" },
                { title: "Núm Factura", field: "invoice_number", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item.status === "pagado" ? "green" : item.status === "rechazado" ? "red" : "black"
                    })
                },
                { title: "Núm Presupuesto", field: "estimatate.estimate_number", style: () => ({ textWrap: "nowrap" }) },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                { title: "Total", field: "total_amount", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ]

            const normalizedInvoices = invoices.map((e, i) => ({
                ...e,
                index: i + 1,
                "estimatate.estimate_number": e.estimate?.estimate_number || "N/A",
                "client.name": e.estimate?.client?.name || "N/A",
                "project.name": e.estimate?.project?.name || "N/A",
                "user.name": e.user?.name || "N/A",
            }))

            if (invoices.length === 0) { return m(SpinnerLoading) }

            return [
                m("h1.py-4.text-uppercase", "Facturas"),
                m(PageEstructure, [
                    m(Table, {
                        key: lastUpdated,
                        columns: columns,
                        data: normalizedInvoices,
                        onRowClick: onSelect,
                        style: { height: "70vh", width: "100%" }

                    }),
                    m(Card, {
                        title: "Resumen",
                        style: { height: "70vh", width: "100%" }
                    }, m(InvoicesResumenCard, { invoices })),
                ]),
                m(ModalDetailsComponent, {
                    invoice: selectedInvoice,
                }),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteInvoice",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el factura con #${selectedInvoice?.invoice_number}?`,
                    actions: () => handleInvoiceAction("delete")
                }),
                m(ModalConfirmation, {
                    idModal: "ModalUpdatePagadoInvoice",
                    tituloModal: "Confirmación de actualización",
                    mensaje: `¿Está seguro de actualizar el estado a PAGADO de la factura con #${selectedInvoice?.invoice_number}?`,
                    actions: () => handleInvoiceAction("pay")
                }),
                m(ModalConfirmation, {
                    idModal: "ModalUpdateRechazadoInvoice",
                    tituloModal: "Confirmación de actualización",
                    mensaje: `¿Está seguro de actualizar el estado a RECHAZADO de la factura con #${selectedInvoice?.invoice_number}?`,
                    actions: () => handleInvoiceAction("rejected")
                })
            ]
        }
    }
}

function ModalDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { invoice = [] } = attrs
            const subtotalMaterials = (invoice?.estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
            const subtotalLabors = (invoice?.estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0)
            const subtotal = subtotalMaterials + subtotalLabors

            const columnsInvoice = [
                { title: "Núm Presupuesto", field: "estimatate.estimate_number", style: () => ({ textWrap: "nowrap" }) },
                { title: "Proyecto", field: "project.name" },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "pagado" ? "green" : item?.status === "rechazado" ? "red" : "black"
                    })
                },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ]

            const columnsClient = [
                { title: "Nombre", field: "name" },
                { title: "NIF", field: "nif" },
                { title: "Telefono", field: "phone" },
                { title: "Email", field: "email" },
                { title: "Dirección", field: "address" },
            ]

            const columnsMaterials = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "material.name" },
                { title: "Cantidad", field: "quantity" },
                { title: "P / U", field: "unit_price", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_price", euroSign: "€" },
            ]

            const columnsLabors = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "labor_type.name" },
                { title: "Descripción", field: "description" },
                { title: "Horas", field: "hours" },
                { title: "P / H", field: "cost_per_hour", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_cost", euroSign: "€" },
            ]

            const normalizedMaterials = (invoice?.estimate?.materials || []).map((m, i) => ({
                ...m,
                index: i + 1,
                "material.name": m?.material?.name || "N/A",
                "quantity": (`${m.quantity} ${m.material?.unit}`) || "N/A",
                "unit_price": m.unit_price || "N/A",
                "discount": m.discount || "N/A",
                "total_price": m.total_price || "N/A",
            }))

            const normalizedLabors = (invoice?.estimate?.labors || []).map((l, i) => ({
                ...l,
                index: i + 1,
                "labor_type.name": l.labor_type?.name || "N/A",
                "hours": l.hours || "N/A",
                "cost_per_hour": l.cost_per_hour || "N/A",
                "discount": l.discount || "N/A",
                "total_cost": l.total_cost || "N/A",
            }))

            // Footer con totales
            const TableFooter = () =>
                m("div.text-end.mt-5.me-2", [
                    m("h6", `SubTotal: ${(subtotal || 0).toFixed(2)} €`),
                    m("h6", `IVA: ${Number(invoice?.estimate?.iva || 0)}%`),
                    m("h5.fw-bold", `Total: ${Number(invoice?.total_amount || 0).toFixed(2)} €`)
                ])

            // Header con botones
            const ContentHeaderModal = () => [
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteInvoice")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Factura"
                ]),
            ]

            const ButtonsActions = () => [
                /* 
                No se puede editar la factura es casi ilegal, pero lo dejo por si algunas vez se requiere
                Lo que si se puede cambiar es el estado, de pendiente a aceptado  o rechazado, pero no al reves   
                */
                invoice?.status === "pendiente" ? [
                    m("h5.text-center.pt-3", "Actualizar Estado"),
                    m("div.d-flex.justify-content-evenly.pb-3", [
                        m(Button, {
                            closeModal: true,
                            bclass: "btn-outline-danger",
                            actions: () =>
                                new bootstrap.Modal(document.getElementById("ModalUpdateRechazadoInvoice")).show()
                        }, [
                            m("i.fa-solid.fa-pen-to-square.text-danger"),
                            " RECHAZADO"
                        ]),
                        m(Button, {
                            closeModal: true,
                            bclass: "btn-outline-success",
                            actions: () =>
                                new bootstrap.Modal(document.getElementById("ModalUpdatePagadoInvoice")).show()
                        }, [
                            m("i.fa-solid.fa-pen-to-square.text-success"),
                            " PAGADO"
                        ])
                    ])
                ] : null
            ]

            // Body con las dos tablas
            const ContentBodyModal = () =>
                m("div", { style: { maxHeight: "60vh", overflowY: "auto", padding: "1rem" } }, [
                    ButtonsActions(),
                    m("h5.mt-1", "Detalles"),
                    m("hr"),
                    m(TableModal, { columns: columnsInvoice, data: [invoice] }),
                    m("h5.mt-3", "Detalles del cliente"),
                    m(TableModal, { columns: columnsClient, data: [invoice?.estimate?.client] }),
                    m("hr"),
                    m("h5.mt-3", "Conceptos"),
                    m("hr"),
                    m("h5.mt-3", "Materiales"),
                    m(TableModal, { columns: columnsMaterials, data: normalizedMaterials }),
                    m("h5.mt-3", "Mano de Obra"),
                    m(TableModal, { columns: columnsLabors, data: normalizedLabors }),
                    TableFooter()
                ])

            // Footer con botón de PDF
            const ContentFooterModal = () =>
                m(Button, {
                    actions: () => {
                        m.mount(document.getElementById("hidden-pdf"), {
                            view: () => m(GeneratePDF, {
                                invoice: invoice,
                                title: "factura",
                            })
                        })
                    }, bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ])

            return m(Modal, {
                idModal: "ModalDetailsInvoicesList",
                title: `Factura #${invoice?.invoice_number}`,
                addBtnClose: true,
                slots: {
                    header: ContentHeaderModal(),
                    body: ContentBodyModal(),
                    footer: ContentFooterModal()
                }
            })
        }
    }
}