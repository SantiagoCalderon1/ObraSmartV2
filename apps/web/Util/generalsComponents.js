function BaseComponent() {
    return {
        view: function () {
            return m("div", content)
        },
    }
}

export function isAuthenticated() {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
}


 
// ==================== Componentes para la estructura Lista ========================================
export function TableListComponent() {
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







// ==================== Componentes para la estructura Modal ========================================
export function Modal() {
    return {
        view: function ({ attrs }) {
            const { idModal, title, addBtnClose } = attrs
            const slots = attrs.slots || {};
            return m("div.modal.fade", { id: idModal, tabindex: "-1", ariaLabelledby: idModal, ariaHidden: "true", }, [
                m("div.modal-dialog.modal-xl.modal-dialog-centered", [
                    m("div.modal-content", [
                        m("div.modal-header", [
                            m("h1.modal-title.fs-5", { id: "ModalGeneral", style: { fontWeight: "bold" } }, title),
                            m("button.btn-close", { "data-bs-dismiss": "modal", arialLabel: "close", }),
                        ]),
                        slots.header && m("div.modal-header.d-flex.justify-content-center.gap-5", slots.header),
                        m("div.modal-body.d-flex.justify-content-center", slots.body ? slots.body : "Cargando detalles..."),
                        m("div.modal-footer.d-flex", { class: slots.footer ? "justify-content-between" : "justify-content-end" }, [
                            slots.footer && slots.footer,
                            addBtnClose && m("button.btn.btn-outline-secondary rounded-pill fw-bold py-2", { "data-bs-dismiss": "modal" }, "Cerrar"),
                        ]),
                    ]),
                ]),
            ])
        },
    }

}

export function ModalConfirmation() {
    return {
        view: function ({ attrs }) {
            const { idModal, tituloModal, mensaje, actions } = attrs

            const ContentFooterModal = () =>
                m("div", { class: "col-12 d-flex justify-content-center" }, [
                    m("div", { class: "col-8 col-md-4 d-flex justify-content-between gap-5" }, [
                        m(Button, {
                            closeModal: true,
                            bclass: "btn btn-danger ",
                        }, ["Cancelar"]),
                        m(Button, {
                            closeModal: true,
                            bclass: "btn btn-success ",
                            actions: actions,
                        }, ["aceptar"])
                    ])
                ])
            return m(Modal, {
                idModal: idModal,
                title: tituloModal,
                slots: {
                    body: m("p.text-center", mensaje),
                    footer: ContentFooterModal(),
                }
            })
        }
    }
}

// ==================== Componentes para la estructura Botones ========================================
export function Button() {
    return {
        view: function ({ attrs, children }) {
            const { actions, style, type = "button", closeModal = false, bclass = "btn btn-success" } = attrs
            return m("button", {
                "data-bs-dismiss": closeModal ? "modal" : "",
                type: type,
                class: `btn rounded-pill fw-normal py-2 ${bclass}`,
                onclick: actions,
                style: { fontWeight: "bold", ...style }
            }, children)
        },
    }
}
