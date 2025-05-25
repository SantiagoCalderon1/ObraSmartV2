import { fetchEstimates } from "../Services/services.js"

export function EstimatesResumenCard() {
    let estimates = []
    return {
        oncreate: async function () {
            estimates = (await fetchEstimates()).data || []
            console.log("estimates", estimates);
            m.redraw()
        },
        view: function () {

            // Filtros
            const a = est => est.status === "Aceptado"
            const b = est => est.status === "Pendiente"
            const c = est => est.status === "Rechazado"

            // Conteos
            const totalEstimates = estimates.length
            const aceptados = estimates.filter(a).length
            const pendientes = estimates.filter(b).length
            const rechazados = estimates.filter(c).length

            // Sumas y cálculos
            const costoTotal = estimates.reduce((sum, est) => sum + parseFloat(est.total_cost || 0), 0).toFixed(2)

            const totalMaterialDescuentos = estimates.reduce((sum, est) => {
                return sum + (est.materials || []).reduce((matSum, mat) => matSum + parseFloat(mat.discount || 0), 0)
            }, 0)

            const totalLaborDescuentos = estimates.reduce((sum, est) => {
                return sum + (est.labors || []).reduce((labSum, lab) => labSum + parseFloat(lab.discount || 0), 0)
            }, 0)

            const totalDescuentos = (totalMaterialDescuentos + totalLaborDescuentos).toFixed(2)

            const totalIva = estimates.reduce((sum, est) => {
                const iva = parseFloat(est.iva || 0)
                const coste = parseFloat(est.total_cost || 0)
                return sum + (coste * iva / 100)
            }, 0).toFixed(2)

            const totalMateriales = estimates.reduce((sum, est) => {
                return sum + (est.materials || []).reduce((matSum, mat) => matSum + parseFloat(mat.total_price || 0), 0)
            }, 0).toFixed(2)

            const totalLabores = estimates.reduce((sum, est) => {
                return sum + (est.labors || []).reduce((labSum, lab) => labSum + parseFloat(lab.total_cost || 0), 0)
            }, 0).toFixed(2)

            return m("ul.list-group.list-group-flush", [
                m("li.list-group-item.text-uppercase", "Recuento"),
                m("li.list-group-item.text-success", `Aceptados: ${aceptados}`),
                m("li.list-group-item.text-warning", `Pendientes: ${pendientes}`),
                m("li.list-group-item.text-danger", `Rechazados: ${rechazados}`),
                m("li.list-group-item.fw-bold", `Total: ${totalEstimates}`),

                m("li.list-group-item.mt-4.text-uppercase", "Totales monetarios"),
                m("li.list-group-item.text-warning", `Total IVA: $${totalIva}`),
                m("li.list-group-item.text-danger", `Total Descuentos: $${totalDescuentos}`),
                m("li.list-group-item.fw-bold", `Costo Total: $${costoTotal}`),

                m("li.list-group-item.mt-4.text-uppercase", "Costos por categoría"),
                m("li.list-group-item.text-success", `Total Materiales: $${totalMateriales}`),
                m("li.list-group-item.text-success", `Total Labores: $${totalLabores}`),
            ])

        }
    }
}