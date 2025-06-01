export function Table() {
    let containerStyle = { width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", overflow: "hidden" }

    let localData = []
    let filteredData = []
    let searchValue = ""
    let sortState = {
        campo: null,
        tipo: "asc"
    }

    let currentPage = 1
    let rowsPerPage = 20
    let viewAll = false


    function getPagedData() {
        if (viewAll) return filteredData
        const start = (currentPage - 1) * rowsPerPage
        return filteredData.slice(start, start + rowsPerPage)
    }

    function totalPages() {
        return Math.ceil(filteredData.length / rowsPerPage)
    }

    function orderData(campo) {
        if (sortState.campo === campo) {
            sortState.tipo = sortState.tipo === "asc" ? "desc" : "asc"
        } else {
            sortState.campo = campo
            sortState.tipo = "asc"
        }
        filteredData = [...filteredData].sort((a, b) => {
            const valA = a[campo]
            const valB = b[campo]
            if (typeof valA === "string") {
                return sortState.tipo === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA)
            } else {
                return sortState.tipo === "asc"
                    ? valA - valB
                    : valB - valA
            }
        })
        currentPage = 1
    }

    function filterData(searchValue) {
        filteredData = localData.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
        )
        currentPage = 1
    }


    return {
        oninit: ({ attrs }) => {
            localData = [...attrs.data];
            filteredData = [...localData];
        },
 
        view: function ({ attrs, children }) {
            const { columns = [], onRowClick = null, maxHeightTable = "45vh", offset = "offset-md-6" } = attrs
            return m("div.col-11.col-md-10", { style: { ...containerStyle, ...attrs.style } }, [
                m("div.col-12", [
                    m("div.row", [
                        m("div.col-12", {
                            style: {
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                padding: "10px 20px",
                            }
                        }, [
                            m("div.input-group.flex-nowrap", [children ? children : null]),
                            m(`div.input-group.flex-nowrap${offset ? ` ${offset}` : ""}`, [
                                m("input.form-control", {
                                    type: "text",
                                    placeholder: "Buscar...",
                                    "aria-label": "find",
                                    "aria-describedby": "addon-wrapping",
                                    value: searchValue,
                                    oninput: (e) => {
                                        searchValue = e.target.value
                                        filterData(searchValue)
                                    }
                                }),
                                m("span.input-group-text", {
                                    id: "addon-wrapping",
                                    onclick: (e) => {
                                        e.target.closest(".input-group").querySelector("input").focus()
                                    },
                                }, m("i.fa-solid.fa-magnifying-glass")),
                            ])
                        ])
                    ]),
                    m("div.table-responsive", { style: { height: maxHeightTable, overflowY: "auto" } }, [
                        m("table.table.table-striped.table-hover", { style: { width: "100%", borderCollapse: "collapse" } }, [
                            m("thead.bg-light.sticky-top", { style: { top: "0", zIndex: "2" } }, [
                                m("tr.text-start.text-nowrap", { style: { cursor: "pointer" } },
                                    columns.map((col) => {
                                        let sortIcon = "fa-sort"
                                        if (sortState.campo === col.field) {
                                            sortIcon = sortState.tipo === "asc" ? "fa-sort-up" : "fa-sort-down"
                                        }
                                        return m("th.text.nowrap", {
                                            scope: "col",
                                            onclick: () => orderData(col.field)
                                        }, [
                                            col.title + " ",
                                            m("i.fa-solid", { class: sortIcon })
                                        ])
                                    })
                                ),
                            ]),
                            m("tbody", getPagedData().map((item) =>
                                m("tr.text-start", {
                                    style: { cursor: "pointer" },
                                    onclick: () => onRowClick(item),
                                }, [
                                    columns.map((col) =>
                                        m("td", {
                                            style: typeof col.style == "function" ? col.style(item) : {}
                                        }, [
                                            item[col.field] || "N/A",
                                            col.euroSign && item[col.field] ? col.euroSign : ""
                                        ])
                                    )
                                ])
                            )),
                        ]),
                    ]),
                    // Footer con paginador y "ver todos"
                    m("div.d-flex.flex-column.justify-content-center.align-items-center.mt-3.gap-2", [
                        m("div.d-flex.justify-content-center.align-items-center.mt-3.gap-sm-1.gap-md-3", [
                            // Botón anterior
                            m("button.btn.btn-outline-secondary", {
                                onclick: () => {
                                    if (currentPage > 1) {
                                        currentPage--
                                        m.redraw()
                                    }
                                },
                                disabled: viewAll || currentPage === 1
                            }, "Anterior"),
                            // Botón ver todos / ver menos
                            m("button.btn.btn-outline-primary.text-nowrap", {
                                onclick: () => {
                                    viewAll = !viewAll
                                    currentPage = 1
                                    m.redraw()
                                }
                            }, viewAll ? "Ver menos" : "Ver todos"),
                            // Botón siguiente
                            m("button.btn.btn-outline-secondary", {
                                onclick: () => {
                                    if (currentPage < totalPages()) {
                                        currentPage++
                                        m.redraw()
                                    }
                                },
                                disabled: viewAll || currentPage === totalPages()
                            }, "Siguiente")
                        ]),
                        m("div.text-muted.mt-2", {
                            style: { fontSize: "0.9rem" }
                        }, viewAll
                            ? `Mostrando todos (${filteredData.length})`
                            : `Página ${currentPage} de ${totalPages()}`
                        )
                    ]),
                ])
            ])
        },
    }
}