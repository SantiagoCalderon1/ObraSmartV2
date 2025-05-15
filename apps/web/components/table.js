export function Table() {
    let style = {
        containerStyle: { minHeight: "10vh", maxHeight: "75vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", overflow: "hidden" }
    }

    let localData = []
    let filteredData = []
    let searchValue = ""
    let sortState = {
        campo: null,
        tipo: "asc"
    }

    function orderData(campo) {
        if (sortState.campo === campo) {
            sortState.tipo = sortState.tipo === "asc" ? "desc" : "asc"
        } else {
            sortState.campo = campo
            sortState.tipo = "asc"
        }
        filteredData = [...localData].sort((a, b) => {
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
        m.redraw()
    }

    function filterData(searchValue) {
        filteredData = localData.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchValue.toLowerCase())
            )
        )
        m.redraw()
    }

    return {
        oninit: function ({ attrs }) {
            localData = attrs.data
            filteredData = [...localData]
        },
        view: function ({ attrs, children }) {
            const { columns = [], onRowClick = null } = attrs

            return m("div.col-11.col-md-10", { style: style.containerStyle }, [
                m("div.col-12", [
                    m("div.row", [
                        m("div.col-12.col-md-6.offset-md-6", {
                            style: { display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px", padding: "10px 20px", }
                        }, [
                            m("div.input-group.flex-nowrap", [children ? children : null,]),
                            m("div.input-group.flex-nowrap", [
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
                    m("div.table-responsive", { style: { maxHeight: "65vh", overflowY: "auto" } }, [
                        m("table.table.table-striped.table-hover", { style: { width: "100%", borderCollapse: "collapse" } }, [
                            m("thead.bg-light.sticky-top", { style: { top: "0", zIndex: "2" } }, [
                                m("tr.text-start", { style: { cursor: "pointer" } },
                                    columns.map((col) => m("th", {
                                        scope: "col",
                                        onclick: () => orderData(col.field)
                                    }, col.title + " ", m("i.fa-solid.fa-sort")))),
                            ]),
                            m("tbody", filteredData.map((item) =>
                                m("tr.text-start", {
                                    style: { cursor: "pointer" },
                                    onclick: () => onRowClick(item),
                                }, [
                                    columns.map((col) => m("td", { style: typeof col.style == "function" ? col.style(item) : {} }, [item[col.field] || "N/A", col.euroSign && item[col.field] ? col.euroSign : ""]))
                                ])
                            )),
                        ]),
                    ]),
                ]),
            ])
        },
    }
}
