import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Button } from "../../components/button.js"
import { Table } from "../../components/table.js"
import { Card } from "../../components/card.js"
import { EstimatesResumenCard } from "../../components/card-estimates.js"
import { PageEstructure } from "../../components/page-estrcuture.js"
import { TableModal } from "../../components/table-modal.js"
import { SpinnerLoading } from "../../components/spinner-loading.js"
import { GeneratePDF } from "../../components/generate-pdf.js"


// IMPORTADOR DE FUNCIONES
import { fetchEstimates, deleteEstimate } from "../../Services/services.js"

export function EstimatesListPage() {
    let style = { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" };

    let estimates = []
    let selectedEstimate = null
    let lastUpdated = Date.now()

    // funcion asincrona que trae los datos
    async function loadEstimates() {
        estimates = (await fetchEstimates()).data
        lastUpdated = Date.now()

        m.redraw()
    }
    return {
        oncreate: loadEstimates,
        view: function () {

            const onSelect = (estimate) => {
                selectedEstimate = estimate
                new bootstrap.Modal(document.getElementById("ModalDetailsEstimatesList")).show()
                m.redraw()
            }

            const onDelete = async () => {
                if (selectedEstimate) {
                    try {
                        let response = await deleteEstimate(selectedEstimate.estimate_id)
                        if (response) {
                            Toastify({
                                text: "¡Operación exitosa!",
                                className: "toastify-success",
                                duration: 3000,
                                close: true,
                                gravity: "top",
                                position: "right"
                            }).showToast()
                        }
                    } catch (error) {
                        Toastify({
                            text: "¡Algo salió mal!",
                            className: "toastify-error",
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right"
                        }).showToast()
                    } finally {
                        selectedEstimate = null
                        await loadEstimates()
                        m.redraw()
                    }
                }
            }

            const columns = [
                { title: "#", field: "index" },
                { title: "Núm Presupuesto", field: "estimate_number", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item.status === "Aceptado" ? "green" : item.status === "Rechazado" ? "red" : "black"
                    })
                },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                { title: "Total", field: "total_cost", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ]

            const normalizedEstimates = (estimates || []).map((e, i) => ({
                ...e,
                index: i + 1,
                "client.name": e.client?.name || "N/A",
                "project.name": e.project?.name || "N/A",
                "user.name": e.user?.name || "N/A",
            }))

            if (estimates.length === 0) { return m(SpinnerLoading) }
            return [
                m("h1.py-4.text-uppercase", "Presupuestos"),
                m(PageEstructure, [
                    m(Table, {
                        key: lastUpdated,
                        columns: columns,
                        data: normalizedEstimates,
                        onRowClick: onSelect,
                        style: { height: "70vh", width: "100%" }
                    }, [m(Button,
                        {
                            type: "submit",
                            bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                            style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: () => m.route.set("/estimates/create")
                        },
                        ["Crear Presupuesto"]
                    ),]),
                    m(Card, {
                        title: "Resumen",
                        style: { height: "70vh", width: "100%" }
                    }, m(EstimatesResumenCard, { estimates })),
                ]),
                m(ModalDetailsComponent, {
                    estimate: selectedEstimate,
                }),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteEstimate",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el presupuesto con #${selectedEstimate?.estimate_number}?`,
                    actions: onDelete
                })
            ]
        }
    }
}

function ModalDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { estimate = [] } = attrs

            const subtotalMaterials = (estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
            const subtotalLabors = (estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0)
            const subtotal = subtotalMaterials + subtotalLabors

            const columnsEstimate = [
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "Aceptado" ? "green" : item?.status === "Rechazado" ? "red" : "black"
                    })
                },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                { title: "Usuario", field: "user.name" },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
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

            const normalizedMaterials = (estimate?.materials || []).map((m, i) => ({
                ...m,
                index: i + 1,
                "material.name": m?.material?.name || "N/A",
                "quantity": (`${m.quantity} ${m.material?.unit}`) || "N/A",
                "unit_price": m.unit_price || "N/A",
                "discount": m.discount || "N/A",
                "total_price": m.total_price || "N/A",
            }))

            const normalizedLabors = (estimate?.labors || []).map((l, i) => ({
                ...l,
                index: i + 1,
                "labor_type.name": l.labor_type?.name || "N/A",
                "description": l.description || "N/A",
                "hours": l.hours || "N/A",
                "cost_per_hour": l.cost_per_hour || "N/A",
                "discount": l.discount || "N/A",
                "total_cost": l.total_cost || "N/A",
            }))

            // Footer con totales
            const TableFooter = () =>
                m("div.text-end.mt-5.me-2", [
                    m("h6", `SubTotal: ${(subtotal || 0).toFixed(2)} €`),
                    m("h6", `IVA: ${Number(estimate?.iva || 0)}%`),
                    m("h5.fw-bold", `Total: ${Number(estimate?.total_cost || 0).toFixed(2)} €`)
                ])

            // Header con botones
            const ContentHeaderModal = () => [
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteEstimate")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Presupuesto"
                ]),
                m(Button, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => m.route.set(`/estimates/update/${estimate.estimate_number}`)
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Presupuesto"
                ])
            ]

            // Body con las dos tablas
            const ContentBodyModal = () =>
                m("div", {
                    style: {
                        maxHeight: "60vh",
                        overflowY: "auto",
                        padding: "1rem"
                    }
                }, [
                    m("h5.mt-1", "Detalles"),
                    m(TableModal, { columns: columnsEstimate, data: [estimate] }),
                    m("hr"),
                    m("h5.mt-3", "Conceptos"),
                    m("hr"),
                    m("h5.mt-3", "Materiales"),
                    m(TableModal, { columns: columnsMaterials, data: normalizedMaterials }),
                    m("h5.mt-3", "Mano de Obra"),
                    m(TableModal, { columns: columnsLabors, data: normalizedLabors }),
                    m("div.mt-3", [m("span.fw-bold", "Condiciones: "), (estimate?.conditions || "N/A")]),
                    TableFooter()
                ])

            // Footer con botón de PDF
            const ContentFooterModal = () => [
                m(Button, {
                    actions: () => {
                        m.mount(document.getElementById("hidden-pdf"), {
                            view: () => m(GeneratePDF, {
                                estimate: estimate,
                                title: "presupuesto",
                            })
                        })
                    },
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ]),
                estimate?.status === "Aceptado" ? m(Button, {
                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" },
                    actions: () => m.route.set(`/invoices/create/${estimate?.estimate_number}`),
                    closeModal: true
                }, [
                    "Generar Factura ",
                    m("i.fa-solid.fa-file-invoice-dollar", { style: { color: "white" } })
                ]) : null,
            ]

            return m(Modal, {
                idModal: "ModalDetailsEstimatesList",
                title: `Presupuesto #${estimate?.estimate_number}`,
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

