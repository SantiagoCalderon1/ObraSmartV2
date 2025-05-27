export function TableModal() {
    return {
        view: function ({ attrs }) {
            const { columns, data, maxHeight = true, toPDF = false } = attrs
            return m("div.table-responsive", {
                style: {
                    maxHeight: maxHeight ? "50vh" : "",
                }
            },
                [
                    m("table", { class: "table table-hover table-striped" }, [
                        m("thead", { class: "py-5 bg-light sticky-top top-0" }, [
                            m("tr", [
                                ...columns.map(col =>
                                    m("th", {
                                        class: ` ${toPDF ? '' : 'px-4 py-3 text-nowrap'}`
                                    }, col.title))
                            ])
                        ]),
                        m("tbody", [
                            data.length > 0
                                ? data.map(item =>
                                    m("tr", [
                                        ...columns.map(col =>
                                            m(`td`, {
                                                class: ` ${toPDF ? "" : (col.field === 'description' ? '' : 'px-4 py-3 text-nowrap')}  `,

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
                ])
        }
    }
}