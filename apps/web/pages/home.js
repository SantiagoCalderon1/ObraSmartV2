import { Chart, registerables } from 'chart.js'
Chart.register(...registerables)

// IOMPORTADOR DE COMPONENTES REUTILIZABLES
import { SpinnerLoading } from "../components/spinner-loading.js"
import { fetchProjects, fetchEstimates, fetchInvoices } from "../Services/services.js"
import { generateLastMonths } from "../Util/util.js"

import { Card } from "../components/card.js"

export function HomePage() {
    let style = { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" };
    let projects = []
    let invoices = []
    let estimates = []
    let loading = true

    return {
        oncreate: async function () {
            window.scrollTo(0, 0);
            projects = (await fetchProjects()).data || []
            invoices = (await fetchInvoices()).data || []
            estimates = (await fetchEstimates()).data || []
            loading = false
            m.redraw()
        },
        view: function () {
            if (loading) { return m("div", { style }, m(SpinnerLoading)) }

            return m("div", { style }, [
                m("h1.py-5.text-uppercase", "¡Bienvenido!"),
                m("div.container", { style: { maxWidth: "1400px" } }, [
                    m("div.row", [
                        m("div.col-12.col-lg-6", [
                            m("div.row", [
                                m(Card, { title: "facturación mensual", style: { height: "100%", maxHeight: "45vh" } }, m(FacturacionMensualChart, { invoices })),
                                m(Card, { title: "top proyectos" }, m(FacturacionProyectosChart, { projects: projects, type: 2 })),
                                m(Card, { title: "" }, m(FacturacionProyectosChart, { projects: projects, type: 1 })),
                            ])
                        ]),
                        m("div.col-12.col-lg-6", [
                            m("div.row", [
                                m(Card, { title: "Estado Proyectos" }, m(ProjectStatusChartBox, { projects })),
                                m(Card, { title: "Presupuestación mensual" }, m(PresupuestacionMensualChart, { estimates })),
                            ])
                        ])
                    ])
                ])
            ])
        }
    }
}

function FacturacionMensualChart() {
    return {
        oncreate: ({ attrs, dom }) => {
            const ctx = dom.querySelector("canvas").getContext("2d");
            const invoices = attrs.invoices || [];

            const months = generateLastMonths(6);

            const totalsByMonth = months.map(({ year, month }) => {
                const total = invoices
                    .filter(inv => {
                        return (inv.status === "pagado" || inv.status === "pendiente") &&
                            new Date(inv.issue_date).getFullYear() === year &&
                            new Date(inv.issue_date).getMonth() === month;
                    })
                    .reduce((sum, inv) => sum + parseFloat(inv.total_amount || 0), 0)
                return total;
            });

            new Chart(ctx, {
                type: "line",
                data: {
                    labels: months.map(m => m.label),
                    datasets: [{
                        label: "Facturación (€)",
                        data: totalsByMonth,
                        backgroundColor: "rgba(54, 162, 235, 0.2)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Facturación mensual"
                        }
                    }
                }
            });
        }
        ,
        view: () =>
            m("div", {
                style: {
                    width: "100%",
                    height: "100%",
                }
            }, m("canvas"))
    };
}

function FacturacionProyectosChart() {
    return {
        oncreate: ({ attrs, dom }) => {
            const ctx = dom.querySelector("canvas").getContext("2d");
            const { projects = [], type = 1 } = attrs

            // Calcular facturación por proyecto
            const projectTotals = projects.map(project => {
                const totalRevenue = (project.estimates || []).reduce((sum, est) => {
                    return sum + parseFloat(est.total_cost || 0);
                }, 0);
                return {
                    name: project.name,
                    total: totalRevenue
                };
            });

            // Ordenar por total y obtener 3
            const resultProjects = projectTotals
                .sort((a, b) => type === 1 ? a.total - b.total : b.total - a.total)
                .slice(0, 3);

            // Título según el tipo
            const chartTitle = type === 1 ?
                "Top 3 proyectos con menor facturación" :
                "Top 3 proyectos con mayor facturación";

            // Crear gráfico
            new Chart(ctx, {
                type: "bar",
                data: {
                    labels: resultProjects.map(p => p.name),
                    datasets: [{
                        label: "Facturación (€)",
                        data: resultProjects.map(p => p.total),
                        backgroundColor: "rgba(153, 102, 255, 1)"
                    }]
                },
                options: {
                    indexAxis: 'y',
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: chartTitle
                        }
                    }
                }
            });
        },
        view: () => m("div", {
            style: {
                width: "100%",
                height: "100%",
            }
        }, m("canvas"))
    };
}

function PresupuestacionMensualChart() {
    return {
        oncreate: ({ attrs, dom }) => {
            const ctx = dom.querySelector("canvas").getContext("2d");
            const estimates = attrs.estimates || [];

            // Generar los últimos 6 meses

            const months = generateLastMonths(6);

            // Contar presupuestos emitidos por mes
            const countsByMonth = months.map(({ year, month }) => {
                return estimates.filter(est => {
                    const estDate = new Date(est.issue_date);
                    return estDate.getFullYear() === year && estDate.getMonth() === month;
                }).length;
            });

            // Crear gráfico
            new Chart(ctx, {
                type: "line",
                data: {
                    labels: months.map(m => m.label),
                    datasets: [{
                        label: "Presupuestos Emitidos",
                        data: countsByMonth,
                        backgroundColor: "rgba(153, 102, 255, 0.2)",
                        borderColor: "rgba(153, 102, 255, 1)",
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Presupuestos emitidos últimos 6 meses"
                        }
                    }
                }
            });
        },
        view: () =>
            m("div", { style: { width: "100%", height: "100%" } }, m("canvas"))
    };
}

function ProjectStatusChartBox() {
    return {
        oncreate: ({ dom, attrs }) => {
            const projects = attrs.projects || [];

            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(now.getMonth() - 6);

            const statusCount = projects.reduce((acc, project) => {
                const startDate = new Date(project.start_date);

                const dentroRango = startDate >= sixMonthsAgo && startDate <= now;

                if (dentroRango) {
                    const status = project.status;
                    if (status === "en proceso" || status === "completado" || status === "cancelado") {
                        acc[status] = (acc[status] || 0) + 1;
                    }
                }

                return acc;
            }, {});

            const labels = Object.keys(statusCount);
            const data = Object.values(statusCount);

            // Colores para los 3 estados, el orden debe coincidir con labels
            const backgroundColors = labels.map(status => {
                if (status === "en proceso") return "rgba(255, 206, 86, 0.6)"; // amarillo
                if (status === "completado") return "rgba(153, 102, 255, 1)"; // azul
                if (status === "cancelado") return "rgba(255, 99, 132, 0.6)"; // rojo
                return "rgba(201, 203, 207, 0.6)"; // gris fallback
            });

            const ctx = dom.querySelector("canvas").getContext("2d");

            new Chart(ctx, {
                type: "doughnut",
                data: {
                    labels,
                    datasets: [{
                        label: "Cantidad de proyectos",
                        data,
                        backgroundColor: backgroundColors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Proyectos iniciados en los últimos 6 meses"
                        },
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            });
        },
        view: () => m("div", {
            style: {
                width: "100%",
                height: "100%",
            }
        }, m("canvas"))
    };
}





