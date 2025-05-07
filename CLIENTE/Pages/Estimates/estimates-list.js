import { ModalComponent, ModalConfirmation, ButtonComponent } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchEstimates, deleteEstimate } from "../../Services/services.js";

export function EstimatesListPage() {
    let estimates = [];
    let selectedEstimate = null;

    async function loadEstimates() {
        estimates = (await fetchEstimates()).data;
        m.redraw();
    }

    return {
        oncreate: loadEstimates,
        view: function () {
            const onSelect = (estimate) => {
                selectedEstimate = estimate;
                new bootstrap.Modal(document.getElementById("ModalDetailsEstimatesList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedEstimate) {
                    await deleteEstimate(selectedEstimate.estimate_id);
                    selectedEstimate = null;
                    await loadEstimates();
                }
            };

            const columns = [
                { title: "#", field: "index" },
                { title: "Núm Presupuesto", field: "estimate_number" },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item.status === "aceptado" ? "green" : item.status === "rechazado" ? "red" : "black"
                    })
                },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                {
                    title: "Total", field: "total_cost", euroSign: "€", style: () => ({
                        textWrap: "nowrap"
                    })
                }
            ];

            // Normaliza los datos para la tabla (añade índice y campos planos)            
            const normalizedEstimates = (estimates || []).map((e, i) => ({
                ...e,
                index: i + 1,
                "client.name": e.client?.name || "N/A",
                "project.name": e.project?.name || "N/A",
                "user.name": e.user?.name || "N/A",
            }));

            if (estimates.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Presupuestos"),
                m(TableListComponent, {
                    columns: columns,
                    data: normalizedEstimates,
                    onRowClick: onSelect
                }, [m(ButtonComponent,
                    {
                        type: "submit",
                        bclass: "btn-primary py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                        actions: () => m.route.set("/estimates/create")
                    },
                    ["Crear Presupuesto"]
                ),]),
                m(ModalDetailsComponent, {
                    estimate: selectedEstimate,
                }),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteEstimate",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el presupuesto con #${selectedEstimate?.estimate_number}?`,
                    actions: onDelete
                })
            ];
        }
    };
}

function TableListComponent() {
    let localData = [];
    let filteredData = [];
    let searchValue = "";
    let sortState = { campo: null, tipo: "asc" };

    function orderData(campo) {
        if (sortState.campo === campo) {
            sortState.tipo = sortState.tipo === "asc" ? "desc" : "asc";
        } else {
            sortState.campo = campo;
            sortState.tipo = "asc";
        }

        filteredData = [...localData].sort((a, b) => {
            const valA = a[campo];
            const valB = b[campo];
            if (typeof valA === "string") {
                return sortState.tipo === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return sortState.tipo === "asc" ? valA - valB : valB - valA;
            }
        });

        m.redraw();
    }

    function filterData(value) {
        filteredData = localData.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(value.toLowerCase())
            )
        );
        m.redraw();
    }

    return {
        oninit: function ({ attrs, children }) {
            localData = attrs.data;
            filteredData = [...localData];
        },
        view: function ({ attrs, children }) {
            const { columns = [], onRowClick = null } = attrs;

            return m("div", {
                class: "col-11 col-md-10 p-3 rounded",
                style: {
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
                }
            }, [
                m("div",
                    { class: "d-flex flex-column flex-md-row justify-content-between mb-3 gap-3" }, [
                    children,
                    m("div.input-group",
                        { style: { maxWidth: "400px" } }, [
                        m("input", {
                            class: `form-control px-3 py-2 me-2 rounded-pill`,
                            style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
                            placeholder: "Buscar...",
                            value: searchValue,
                            oninput: e => {
                                searchValue = e.target.value;
                                filterData(searchValue);
                            }
                        }),
                        m(ButtonComponent,
                            {
                                bclass: "btn btn-outline-secondary rounded-pill fw-normal",
                                style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
                            }, m("i.fa.fa-search")
                        ),
                    ])
                ]),
                m("div.table-responsive", [
                    m("table", { class: "table table-hover table-striped" }, [
                        m("thead", { class: "py-5 bg-light sticky-top" },
                            [
                                m("tr", columns.map(col =>
                                    m("th.text-nowrap.px-4.py-3", {
                                        style: { cursor: "pointer" },
                                        onclick: () => orderData(col.field)
                                    }, [
                                        col.title,
                                        m("i.fa.fa-sort.ms-3")
                                    ])
                                ))
                            ]),
                        m("tbody", filteredData.map(item =>
                            m("tr", {
                                onclick: () => onRowClick && onRowClick(item),
                                style: { cursor: "pointer" }
                            }, columns.map(col =>
                                m("td.px-4", {
                                    style: typeof col.style === "function" ? col.style(item) : {}
                                }, [
                                    item[col.field] || "N/A",
                                    col.euroSign && item[col.field] ? col.euroSign : ""
                                ])
                            ))
                        ))
                    ])
                ])
            ]);
        }
    };
}

function ModalDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { estimate = [] } = attrs;

            // Cálculo de subtotales
            const subtotalMaterials = (estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0);
            const subtotalLabors = (estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0);
            const subtotal = subtotalMaterials + subtotalLabors;


            // Columnas para tablas
            const columnsEstimate = [
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "aceptado" ? "green" : item?.status === "rechazado" ? "red" : "black"
                    })
                },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                { title: "Usuario", field: "user.name" },

                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ];

            const columnsMaterials = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "material.name" },
                { title: "Cantidad", field: "quantity" },
                { title: "P / U", field: "unit_price", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_price", euroSign: "€" },
            ];

            const columnsLabors = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "labor_type.name" },
                { title: "Horas", field: "hours" },
                { title: "P / H", field: "cost_per_hour", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_cost", euroSign: "€" },
            ];

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

            // Tabla reusable
            const Table = ({ columns, data }) =>
                m("div.table-responsive", {
                    style: {
                        maxHeight: "50vh",
                    }
                },
                    [
                        m("table", { class: "table table-hover table-striped" }, [
                            m("thead", { class: "py-5 bg-light sticky-top top-0" }, [
                                m("tr", [
                                    ...columns.map(col =>
                                        m("th.text-nowrap.px-4.py-3", col.title))
                                ])
                            ]),
                            m("tbody", [
                                data.length > 0
                                    ? data.map(item =>
                                        m("tr", [
                                            ...columns.map(col =>
                                                m("td.text-nowrap.px-4", {
                                                    style: typeof col.style === "function" ? col.style(item) : {}
                                                }, [
                                                    item?.[col.field] || "N/A",
                                                    col.euroSign && item[col.field] ? col.euroSign : ""
                                                ])
                                            )
                                        ])
                                    )
                                    : m("tr.text-center", m(`td[colspan=${columns.length + 1}]`, "No hay datos disponibles"))
                            ])
                        ])
                    ]);

            // Footer con totales
            const TableFooter = () =>
                m("div.text-end.mt-5.me-2", [
                    m("h6", `SubTotal: ${(subtotal || 0).toFixed(2)} €`),
                    m("h6", `IVA: ${Number(estimate?.iva || 0)}%`),
                    m("h5.fw-bold", `Total: ${Number(estimate?.total_cost || 0).toFixed(2)} €`)
                ]);

            // Header con botones
            const ContentHeaderModal = () => [
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteBudget")).show()
                }, [
                    m("i.fa-solid.fa-trash-can", { style: { color: "white" } }),
                    " Eliminar Presupuesto"
                ]),
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => m.route.set(`/budget/update/${estimate.budget_number}`)
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Presupuesto"
                ])
            ];

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
                    Table({ columns: columnsEstimate, data: [estimate] }),
                    m("h5.mt-3", "Materiales"),
                    Table({ columns: columnsMaterials, data: normalizedMaterials }),
                    m("h5.mt-3", "Mano de Obra"),
                    Table({ columns: columnsLabors, data: normalizedLabors }),
                    m("div.mt-3", [m("span.fw-bold", "Condiciones: "), (estimate?.conditions || "N/A")]),
                    TableFooter()
                ]);

            // Footer con botón de PDF
            const ContentFooterModal = () =>
                m(ButtonComponent, {
                    //actions: () => GeneratePDF(estimate),
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf", { style: { color: "red" } })
                ]);

            // Render del modal
            return m(ModalComponent, {
                idModal: "ModalDetailsEstimatesList",
                title: `Presupuesto #${estimate?.estimate_number}`,
                addBtnClose: true,
                slots: {
                    header: ContentHeaderModal(),
                    body: ContentBodyModal(),
                    footer: ContentFooterModal()
                }
            });
        }
    };
}

