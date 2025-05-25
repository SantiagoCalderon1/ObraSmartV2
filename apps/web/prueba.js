import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// IOMPORTADOR DE COMPONENTES REUTILIZABLES
import { Card } from "./components/card.js"
import { SpinnerLoading } from "./components/spinner-loading.js"
import { fetchProjects, fetchEstimates, fetchInvoices } from "./Services/services.js"

export function HomePage() {
    let style = { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" };
    let projects = []
    let invoices = []
    let estimates = []
    let loading = true

    return {
        oncreate: async () => {
            window.scrollTo(0, 0);
            try {
                projects = (await fetchProjects()).data || []
                console.log("projects", projects);

                invoices = (await fetchInvoices()).data || []
                console.log("invoices", invoices);
                estimates = (await fetchEstimates()).data || []
                console.log("estimates", estimates);
            } catch (err) {
                console.error("Error al cargar datos:", err)
            } finally {
                loading = false
                m.redraw()
            }
        },
        view: function () {
            if (loading) {
                return m("div", { style }, m(SpinnerLoading))
            }

            return m("div", { style }, [
                m("h1.py-5.text-uppercase", "¡Bienvenido!"),
                m("div.container", [
                    m("div.row", [
                        m("div.col-12.col-lg-6", [
                            m("div.row", [
                                m("div.col-12.mb-3", m(Card, { title: "Evolución mensual de facturación" }, m(FacturacionMensualChart, { invoices }))),
                                m("div.col-12.mb-3", m(Card, { title: "Facturación por proyecto" }, m(FacturacionProyectosChart, { projects: projects, type: 1 }))),
                                m("div.col-12.mb-3", m(Card, { title: "Facturación por proyecto" }, m(FacturacionProyectosChart, { projects: projects, type: 2 }))),
                            ])
                        ]),
                        m("div.col-12.col-lg-6", [
                            m("div.row", [
                                m("div.col-12.mb-3", m(Card, { title: "Ingresos y costos por proyecto" }, m(RevenueCostStackedChart, { projects }))),
                                m("div.col-12.mb-3", m(Card, { title: "Presupuestos emitidos por mes" }, m(NumEstimatesFormMonthChart, { estimates }))),
                                m("div.col-12.mb-3", m(Card, { title: "Presupuestos emitidos por mes" }, m(ProjectStatusChartBox, { projects }))),


                                m("div.col-12.mb-3", m(Card, { title: "Presupuestos emitidos por mes" }, m(ProjectStatsCard, { projects }))),
                                m("div.col-12.mb-3", m(Card, { title: "Presupuestos emitidos por mes" }, m(InvoiceStatsCard, { invoices }))),
                                m("div.col-12.mb-3", m(Card, { title: "Presupuestos emitidos por mes" }, m(EstimatesStatsCard, { estimates }))),
                            ])
                        ])
                    ])
                ])
            ])
        }
    }
}


function EstimatesStatsCard() {
    return {
        view: ({ attrs }) => {
            const estimates = attrs.estimates || []

            const totalEstimates = estimates.length

            const acceptedEstimates = estimates.filter(est => est.status === "Aceptado")

            // Total cost de todos los estimates (sumando total_cost como float)
            const totalCost = estimates.reduce((sum, est) => sum + parseFloat(est.total_cost || 0), 0).toFixed(2)

            // Total de descuentos (sumando descuentos en materiales y labores)
            const totalMaterialDiscount = estimates.reduce((sum, est) => {
                return sum + (est.materials || []).reduce((matSum, mat) => matSum + parseFloat(mat.discount || 0), 0)
            }, 0)

            const totalLaborDiscount = estimates.reduce((sum, est) => {
                return sum + (est.labors || []).reduce((labSum, lab) => labSum + parseFloat(lab.discount || 0), 0)
            }, 0)

            const totalDiscount = (totalMaterialDiscount + totalLaborDiscount).toFixed(2)

            // Total IVA aplicado (sumando el IVA de cada estimate, aplicándolo sobre total_cost)
            const totalIva = estimates.reduce((sum, est) => {
                const ivaPercent = parseFloat(est.iva || 0)
                const cost = parseFloat(est.total_cost || 0)
                return sum + (cost * ivaPercent / 100)
            }, 0).toFixed(2)

            // Total costo de materiales (sumando total_price de materiales)
            const totalMaterialsCost = estimates.reduce((sum, est) => {
                return sum + (est.materials || []).reduce((matSum, mat) => matSum + parseFloat(mat.total_price || 0), 0)
            }, 0).toFixed(2)

            // Total costo de labores (sumando total_cost de labores)
            const totalLaborsCost = estimates.reduce((sum, est) => {
                return sum + (est.labors || []).reduce((labSum, lab) => labSum + parseFloat(lab.total_cost || 0), 0)
            }, 0).toFixed(2)

            return m("div.card.shadow-sm.p-3.mb-3.bg-light.border", [
                m("h5.text-primary", "Resumen de Presupuestos"),
                m("div.row", [
                    m("div.col-md-4", [
                        m("p.fw-bold", `Total Presupuestos: ${totalEstimates}`),
                        m("p.text-success", `Aceptados: ${acceptedEstimates.length}`),
                    ]),
                    m("div.col-md-4", [
                        m("p", `Costo Total: $${totalCost}`),
                        m("p", `Descuento Total: $${totalDiscount}`),
                        m("p", `IVA Total: $${totalIva}`),
                    ]),
                    m("div.col-md-4", [
                        m("p", `Costo Total Materiales: $${totalMaterialsCost}`),
                        m("p", `Costo Total Labores: $${totalLaborsCost}`),
                    ]),
                ])
            ])
        }
    }
}



m.mount(document.body, HomePage);