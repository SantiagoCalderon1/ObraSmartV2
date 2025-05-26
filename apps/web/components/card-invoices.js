export function InvoicesResumenCard() {
    return {
        view: function ({ attrs }) {
            const { invoices } = attrs
            const now = new Date()

            const a = inv => inv.status === "pagado"
            const b = inv => new Date(inv.due_date) < now && inv.status !== "pagado"
            const c = inv => new Date(inv.due_date) >= now && inv.status !== "pagado"

            const totalFacturas = invoices.length
            const pagadas = invoices.filter(a).length
            const vencidas = invoices.filter(b).length
            const pendientes = invoices.filter(c).length

            // Sumas
            const totalFacturado = invoices.reduce((sum, inv) =>
                sum + parseFloat(inv.total_amount || 0), 0).toFixed(2)

            const totalPagado = invoices.reduce((sum, inv) =>
                sum + (inv.payments || []).reduce((acc, p) =>
                    acc + parseFloat(p.amount || 0), 0), 0).toFixed(2)

            const totalPendiente = (totalFacturado - totalPagado).toFixed(2)

            return m("ul.list-group.list-group-flush", [
                m("li.list-group-item.text-uppercase", "Recuento"),
                m("li.list-group-item.text-success", `Pagadas: ${pagadas}`),
                m("li.list-group-item.text-warning", `Pendientes: ${pendientes}`),
                m("li.list-group-item.text-danger", `Vencidas: ${vencidas}`),
                m("li.list-group-item.fw-bold", `Total: ${totalFacturas}`),

                m("li.list-group-item.mt-4.text-uppercase", "Totales monetarios"),

                m("li.list-group-item.text-success", `Total Pagado: $${totalPagado}`),
                m("li.list-group-item.text-warning", `Total Pendiente: $${totalPendiente}`),
                m("li.list-group-item.fw-bold", `Total Facturado: $${totalFacturado}`),
            ])
        }
    }
}