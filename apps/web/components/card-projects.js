export function ProjectsResumenCard() {
    return {
        view: function ({ attrs }) {
            const { projects } = attrs
            const now = new Date()
            const mesAux = new Date()
            mesAux.setMonth(now.getMonth() - 6)

            const inRangeProjects = projects.filter(p => {
                const start = new Date(p.start_date)
                return start >= mesAux && start <= now
            })

            const a = p => p.status === "completado"
            const b = p => p.status === "en proceso"
            const c = p => p.status === "cancelado"
            const d = p => new Date(p.end_date) < now
            const e = p => new Date(p.end_date) >= now

            const totalProyectos = inRangeProjects.length
            const completedo = inRangeProjects.filter(a).length
            const enProgreso = inRangeProjects.filter(b).length
            const cancelados = inRangeProjects.filter(c).length
            const activos = inRangeProjects.filter(e).length
            const vencidos = inRangeProjects.filter(d).length

            const sumEstimates = (projFilter) => {
                return inRangeProjects
                    .filter(projFilter)
                    .flatMap(p => p.estimates || [])
                    .filter(e => e.status === "Aceptado")
                    .reduce((acc, e) => acc + parseFloat(e.total_cost || 0), 0)
                    .toFixed(2)
            }

            const totalEstimatesA = sumEstimates(a)
            const totalEstimatesB = sumEstimates(b)

            return m("ul.list-group.list-group-flush", [
                m("li.list-group-item.text-uppercase", "Recuento"),
                m("li.list-group-item.text-success", `Completados: ${completedo}`),
                m("li.list-group-item.text-warning", `En proceso: ${enProgreso}`),
                m("li.list-group-item.text-danger", `Cancelados: ${cancelados}`),
                m("li.list-group-item", `Total: ${totalProyectos}`),

                m("li.list-group-item.mt-4.text-uppercase", `Total ingresos`),
                m("li.list-group-item.text-success", `Ingresos (Completados): $${totalEstimatesA}`),
                m("li.list-group-item.text-warning", `Ingresos (En proceso): $${totalEstimatesB}`),

                m("li.list-group-item.mt-4..text-uppercase", `Datos Extra`),
                m("li.list-group-item.text-success", `A tiempo: ${activos}`),
                m("li.list-group-item.text-danger", `Vencidos: ${vencidos}`),
            ])

        }
    }
}
