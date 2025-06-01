import Choices from 'choices.js'
import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// IOMPORTADOR DE COMPONENTES REUTILIZABLES
import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Table } from "../../components/table.js"
import { Button } from "../../components/button.js"
import { TableModal } from "../../components/table-modal.js"
import { Card } from "../../components/card.js"
import { SpinnerLoading } from "../../components/spinner-loading.js"
import { ModalFormComponent } from "./projects-list.js"
import { GeneratePDF } from "../../components/generate-pdf.js"


// IMPORTADOR DE FUNCIONES
import { fetchProject, deleteInvoice, updateInvoice, fetchMaterials, createStockMovement, deleteEstimate } from "../../Services/services.js"

export function ProjectInfoPage() {
    let project = {}
    let isLoading = true;
    let lastUpdated = Date.now()


    async function loadProject(id = "") {
        isLoading = true;
        m.redraw()
        project = (await fetchProject(id)).data
        if (project?.estimates?.length) {
            project.invoices = project.estimates.map(estimate => ({
                ...estimate.invoice,
                estimate: estimate,
                client: project.client,
                proyectName: project.name
            }))
        }
        console.log(project);

        isLoading = false;
        lastUpdated = Date.now()

        m.redraw()
    }
    return {
        oncreate: function ({ attrs }) {
            loadProject(attrs.id)
        },
        view: function ({ attrs }) {
            if (isLoading) { return m(SpinnerLoading); }

            return [
                m("h1.py-5.text-uppercase", `Proyecto ${project?.name}`),

                m("div.container", [
                    m("div.row", [
                        m("div.col-12.col-lg-6", [
                            m("div.row", [
                                m(Card, { title: "Detalles" }, [m(ProjectDetails, { project })]),
                                project.estimates && project.estimates.length ? [
                                    m(Card, { title: "Gráficos" }, [m(ProjectChartBox, { project }),]),
                                    m(Card, [m(EstimateStatusChartBox, { project })]),
                                    m(Card, [m(InvoicestatusChartBox, { project })])
                                ]
                                    :
                                    m(Card, { title: "Gráficos" }, [m("div", "Cargando gráfico...")]),
                            ])
                        ]),
                        m("div.col-12.col-lg-6", [
                            m("div.row", [
                                m(Card, { title: "Presupuestos" }, [m(EstimatesList, { estimates: project?.estimates, lastUpdated: lastUpdated, reloadData: () => loadProject(attrs.id) })]),
                                m(Card, { title: "Facturas" }, [m(InvoicesList, { invoices: project?.invoices, lastUpdated: lastUpdated, reloadData: () => loadProject(attrs.id) })]),
                                m(Card, { title: "Movimientos de stock" }, [m(StockMovementList, { stockMovements: project?.stock_movements, project_id: project?.project_id, lastUpdated: lastUpdated, reloadData: () => loadProject(attrs.id) })]),
                            ])
                        ])
                    ])
                ]),
                m(ModalFormComponent, {
                    selectedProject: project,
                    onProjectSaved: () => loadProject(attrs.id)
                }),
            ]
        }
    }
}

function ProjectDetails() {
    return {
        view: ({ attrs }) => {
            const project = attrs.project || {}
            return [
                m("div.text-start.col-12", [
                    m("label.form-label.ps-1.fw-bold.text-start", "Nombre "),
                    m("input.form-control[readonly]", {
                        type: "text",
                        value: project.name || "Sin nombre",
                        disabled: true
                    }),
                ]),
                m("div.text-start.col-12", [
                    m("label.form-label.ps-1.fw-bold", "Estado "),
                    m("input.form-control[readonly]", {
                        type: "text",
                        value: project.status,
                        disabled: true,
                        style: {
                            color: project.status === "completado" ? "green" :
                                project.status === "cancelado" ? "red" : "black",
                            textTransform: "uppercase",
                            fontWeight: "bold"
                        }
                    }),
                ]),
                m("div.text-start.col-12", [
                    m("label.form-label.ps-1.fw-bold", "Cliente "),
                    m("input.form-control[readonly]", {
                        type: "text",
                        value: project.client?.name,
                        disabled: true
                    }),
                ]),
                m("div.text-start.col-12", [
                    m("label.form-label.ps-1.fw-bold", "Fecha de inicio"),
                    m("input.form-control[readonly]", {
                        type: "date",
                        value: project.start_date,
                        disabled: true
                    }),
                ]),
                m("div.text-start.col-12", [
                    m("label.form-label.ps-1.fw-bold", "Fecha de fin "),
                    m("input.form-control[readonly]", {
                        type: "date",
                        value: project.end_date,
                        disabled: true
                    }),
                ]),
                m(Button, {
                    closeModal: true,
                    bclass: "btn-warning mt-3",
                    actions: () => {
                        new bootstrap.Modal(document.getElementById("ModalFormProject")).show()
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Project"
                ])
            ]
        }
    }
}

function ProjectChartBox() {
    return {
        oncreate: ({ dom, attrs }) => {
            const { project } = attrs

            const ctx = dom.querySelector("canvas").getContext("2d")

            const labels = project?.estimates?.map(e => {
                const est = e.estimate_number || "Presupuesto"
                const inv = e.invoice?.invoice_number ? e.invoice.invoice_number : "N/A"
                return `${est} - ${inv}`
            }) || []
            const costs = project?.estimates?.map(e => e.total_cost || 0)
            const invoices = project?.estimates?.map(e => e.invoice?.total_amount || 0)

            //console.log(labels, costs, invoices)

            new Chart(ctx, {
                type: "bar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Presupuesto (€)",
                            data: costs,
                            backgroundColor: "rgba(128, 68, 254, 0.6)"
                        },
                        {
                            label: "Facturación (€)",
                            data: invoices,
                            backgroundColor: "rgba(54, 162, 235, 0.6)"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Presupuestos vs Facturación"
                        }
                    }
                }
            })
        },
        view: () => m("div", { style: { width: "100%", height: "100%", } }, m("canvas"))
    }

}

function EstimateStatusChartBox() {
    return {
        oncreate: ({ dom, attrs }) => {
            const { project } = attrs

            const ctx = dom.querySelector("canvas").getContext("2d")

            const statusCount = (project?.estimates || []).reduce((acc, estimate) => {
                const status = (estimate.status === "Rechazado" || estimate.status === "Cancelado") ? "Cancelado" : estimate.status || "Desconocido"
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {})

            const labels = Object.keys(statusCount)
            const data = Object.values(statusCount)

            new Chart(ctx, {
                type: "doughnut", // o "pie"
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Cantidad",
                            data,
                            backgroundColor: [
                                "rgba(153, 102, 255, 0.6)",  // Pendiente
                                "rgba(75, 192, 192, 0.6)",   // Aprobado
                                "rgba(255, 99, 132, 0.6)",   // Canceladof
                            ],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Distribución de Presupuestos por Estado"
                        },
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            })
        },
        view: () =>
            m("div", {
                style: {
                    width: "100%",
                    height: "100%",
                }
            }, m("canvas"))
    }
}

function InvoicestatusChartBox() {
    return {
        oncreate: ({ dom, attrs }) => {
            const { project } = attrs

            const ctx = dom.querySelector("canvas").getContext("2d")

            const statusCount = (project?.invoices || []).reduce((acc, invoice) => {
                const status = (invoice.status === "Rechazado" || invoice.status === "Cancelado") ? "Cancelado" : invoice.status || "Desconocido"
                acc[status] = (acc[status] || 0) + 1
                return acc
            }, {})

            const labels = Object.keys(statusCount)
            const data = Object.values(statusCount)

            new Chart(ctx, {
                type: "pie", // o "doughnut"
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Cantidad",
                            data,
                            backgroundColor: [
                                "rgba(255, 99, 132, 0.6)",   // Canceladof
                                "rgba(153, 102, 255, 0.6)",  // Pendiente
                                "rgba(75, 192, 192, 0.6)",   // Aprobado
                            ],
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Distribución de Facturas por Estado"
                        },
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            })
        },
        view: () =>
            m("div", {
                style: {
                    width: "100%",
                    height: "100%",
                }
            }, m("canvas"))
    }
}

// SECCION DE PRESUPUESTOS
function EstimatesList() {
    let selectedEstimate = null

    return {
        view: function ({ attrs }) {
            const { estimates = [], lastUpdated, reloadData } = attrs

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
                        reloadData?.()
                        selectedEstimate = null
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
                { title: "Total", field: "total_cost", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ]

            const normalizedEstimates = (estimates || []).map((e, i) => ({
                ...e,
                index: i + 1,
            }))

            if (estimates.length === 0) { return m(SpinnerLoading) }

            return [
                m("div.col-12", m(Table, {
                    key: lastUpdated,
                    columns: columns,
                    data: normalizedEstimates,
                    onRowClick: onSelect,
                    maxHeightTable: "30vh",
                    offset: ""
                }, [m(Button,
                    {
                        key: "crear",
                        type: "submit",
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                        style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: () => m.route.set("/estimates/create")
                    },
                    "Crear Presupuesto"
                ),]),),
                m(ModalEstimatesDetailsComponent, {
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

function ModalEstimatesDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { estimate = [] } = attrs

            // Cálculo de subtotales
            const subtotalMaterials = (estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
            const subtotalLabors = (estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0)
            const subtotal = subtotalMaterials + subtotalLabors

            // Columnas para tablas
            const columnsEstimate = [
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "Aceptado" ? "green" : item?.status === "Rechazado" ? "red" : "black"
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

            // Normalización de datos
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
                m("div", { style: { maxHeight: "60vh", overflowY: "auto", padding: "1rem" } }, [
                    m("h5.mt-1", "Detalles"),
                    m(TableModal, { columns: columnsEstimate, data: [estimate] }),
                    m("hr"),
                    m("h5.mt-3", "Detalles del cliente"),
                    m(TableModal, { columns: columnsClient, data: [estimate?.client] }),
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
                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: () => m.route.set(`/invoices/create/${estimate?.estimate_number}`),
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

// SECCION DE FACTURAS
function InvoicesList() {
    let selectedInvoice = null
    return {
        view: function ({ attrs }) {
            const { invoices = [], lastUpdated, reloadData } = attrs

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
                    reloadData?.()
                    selectedInvoice = null
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
                { title: "Núm Presupuesto", field: "estimate_number", style: () => ({ textWrap: "nowrap" }) },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "proyectName" },
                { title: "Total", field: "total_amount", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ]

            const normalizedInvoices = invoices.map((e, i) => ({
                ...e,
                index: i + 1,
                "estimate_number": e?.estimate?.estimate_number || "N/A",
                "client.name": e?.client?.name || "N/A",
            }))

            if (invoices.length === 0) { return m(SpinnerLoading); }

            return [
                m("div.col-12", m(Table, {
                    key: lastUpdated,
                    columns: columns,
                    data: normalizedInvoices,
                    onRowClick: onSelect,
                    maxHeightTable: "30vh",
                    offset: ""
                }),),
                m(ModalInvoicesDetailsComponent, {
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
                }),
            ]
        }
    }
}

function ModalInvoicesDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { invoice = [] } = attrs
            const subtotalMaterials = (invoice?.estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0)
            const subtotalLabors = (invoice?.estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0)
            const subtotal = subtotalMaterials + subtotalLabors

            const columnsInvoice = [
                { title: "Núm Presupuesto", field: "estimate.estimate_number", style: () => ({ textWrap: "nowrap" }) },
                { title: "Proyecto", field: "proyectName" },
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

            const normalizedInvoice = {
                ...invoice,
                "estimate.estimate_number": invoice?.estimate?.estimate_number || "N/A"
            }

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
                    m(TableModal, { columns: columnsInvoice, data: [normalizedInvoice] }),
                    m("h5.mt-3", "Detalles del cliente"),
                    m(TableModal, { columns: columnsClient, data: [invoice?.client] }),
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
                    },
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ])

            // Render del modal
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

// MOVIMINETOS DE STOCK
function StockMovementList() {

    return {
        view: function ({ attrs }) {
            const { stockMovements = [], project_id, lastUpdated, reloadData } = attrs

            const onClick = () => {
                new bootstrap.Modal(document.getElementById("ModalFormStockMovement")).show()
                m.redraw()
            }
            const columns = [
                { title: "#", field: "index" },
                { title: "Nombre material", field: "material.name", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Razón", field: "reason", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item.reason === "compra" ? "green" : item.reason === "uso" ? "red" : "black"
                    })
                },
                { title: "cantidad", field: "quantity" },
            ]

            const normalizedstockMovements = (stockMovements || []).map((e, i) => ({
                ...e,
                index: i + 1,
                "material.name": e?.material?.name || "N/A"
            }))

            if (stockMovements.length === 0) { return m(SpinnerLoading); }

            return [
                m("div.col-12", m(Table, {
                    key: lastUpdated,
                    columns: columns,
                    data: normalizedstockMovements,
                    onRowClick: () => { },
                    maxHeightTable: "30vh",
                    offset: ""
                }, [
                    m(Button, {
                        closeModal: true,
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                        style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: onClick
                    },
                        " Generar Movimiento "
                    )]
                ),),

                m(ModalStockFormComponent, {
                    reloadData: reloadData,
                    project_id: project_id
                })
            ]
        }
    }
}

function ModalStockFormComponent() {
    let style = {
        _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
        _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
    }

    const motivos = [{ value: "ajuste" }, { value: "compra" }, { value: "uso" }]

    let formElement = null
    let badForm = false

    const StockMovementData = ({
        material_id = "",
        project_id = "",
        quantity = 1,
        reason = "",
    } = {}) => ({
        material_id,
        project_id,
        quantity,
        reason
    })

    const state = {
        StockMovementData: StockMovementData(),
        materials: [],
    }

    return {
        oninit: async ({ attrs }) => {
            state.materials = (await fetchMaterials()).data
            state.StockMovementData.project_id = attrs.project_id
            //console.log(state.materials)
        },

        view: function ({ attrs }) {
            const handleFormSubmit = async () => {
                try {
                    //console.log("Datos a enviar: ", state.StockMovementData)

                    if (!state.StockMovementData.material_id) {
                        Toastify({
                            text: "Debes elegir un material.",
                            className: "toastify-error",
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right"
                        }).showToast();
                        return;
                    }

                    const response = await createStockMovement(state.StockMovementData)

                    const modalElement = document.getElementById("ModalFormStockMovement")
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement)
                        modalInstance.hide()
                    }

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
                        text: "¡Error al crear movimiento!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                } finally {
                    attrs.reloadData?.() // Llama al callback si existe
                    state.StockMovementData = StockMovementData()
                    m.redraw()
                }
            }

            const ContentBodyModal = () =>
                m("form", {
                    class: "row col-12",
                    onsubmit: handleFormSubmit,
                    oncreate: ({ dom }) => {
                        formElement = dom
                    },
                }, [
                    m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Nuevo Movimiento de Stock"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
                            //material input
                            m("div", { class: "col-12 py-1" }, [
                                m("label.form-label.ps-1", "Materiales *"),
                                m("select.form-select", {
                                    class: badForm ? "is-invalid" : "",
                                    style: { ...style._input_secondary },
                                    id: "client_id",
                                    value: parseInt(state.StockMovementData.material_id) || "",
                                    onchange: e => {
                                        state.StockMovementData.material_id = parseInt(e.target.value)
                                        m.redraw()
                                    },
                                    onupdate: ({ dom }) => {
                                        if (!dom.choicesInstance && Array.isArray(state.materials) && state.materials.length > 0) {
                                            dom.choicesInstance = new Choices(dom, {
                                                allowHTML: false,
                                                shouldSort: false,
                                                searchPlaceholderValue: "Buscar material...",
                                                itemSelectText: '',
                                            })
                                        }
                                        if (dom.choicesInstance && state.StockMovementData?.material_id) {
                                            dom.choicesInstance.setChoiceByValue(state.StockMovementData.material_id.toString());
                                        }
                                    },
                                }, [
                                    m("option", {
                                        value: "",
                                        disabled: true,
                                        selected: !state.StockMovementData.material_id
                                    }, "-- Selecciona Material --"),
                                    ...(Array.isArray(state.materials)
                                        ? state.materials.map(opt =>
                                            m("option", {
                                                value: parseInt(opt.material_id)
                                            }, opt.name || opt.content || "Sin nombre")
                                        )
                                        : [])
                                ])
                            ]),
                            // Cantidad
                            m("div.col-md-12.col-lg-6.pt-2", [
                                m("label.form-label.ps-1", "Cantidad *"),
                                m("input.form-control", {
                                    style: style._input_main,
                                    type: "number",
                                    min: 1,
                                    required: true,
                                    value: state.StockMovementData.quantity,
                                    oninput: (e) => state.StockMovementData.quantity = +e.target.value
                                })
                            ]),
                            //  Motivo
                            m("div.col-md-12.col-lg-6.pt-2", [
                                m("label.form-label.ps-1", "Motivo *"),
                                m("select.form-select", {
                                    style: style._input_main,
                                    required: true,
                                    value: state.StockMovementData.reason,
                                    onchange: (e) => state.StockMovementData.reason = e.target.value
                                }, [
                                    m("option", { value: "", disabled: true, selected: !state.StockMovementData.reason }, "Selecciona un motivo"),
                                    ...motivos.map(o => m("option", { value: o.value }, o.value))
                                ])
                            ]),
                        ]),
                        //  Botones
                        m("div.col-12.d-flex.justify-content-center.my-5", [
                            m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                                m(Button, {
                                    closeModal: true,
                                    bclass: "btn-danger",
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar"]),
                                m(Button, {
                                    type: "submit",
                                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" },
                                    actions: async (e) => {
                                        e.preventDefault()
                                        if (!formElement.checkValidity()) {
                                            formElement.reportValidity();
                                            return;
                                        }
                                        await handleFormSubmit();
                                    },
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })])
                            ])
                        ])
                    ])
                ])

            return m(Modal, {
                idModal: "ModalFormStockMovement",
                title: `Generando Movimiento de Stock`,
                addBtnClose: false,
                slots: {
                    body: ContentBodyModal()
                }
            })
        }
    }
}