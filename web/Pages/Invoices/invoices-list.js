import { ModalComponent, ModalConfirmation, ButtonComponent } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchInvoices, deleteInvoice } from "../../Services/services.js";

export function InvoicesListPage() {
    let invoices = [];
    let selectedInvoice = null;
    2
    async function loadInvoices() {
        invoices = (await fetchInvoices()).data;
        console.log(invoices);
        m.redraw();
    }

    return {
        oncreate: loadInvoices,
        view: function () {
            const onSelect = (invoice) => {
                selectedInvoice = invoice;
                new bootstrap.Modal(document.getElementById("ModalDetailsInvoicesList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedInvoice) {
                    await deleteInvoice(selectedInvoice.invoice_id);
                    selectedInvoice = null;
                    await loadInvoices();
                }
            };

            const columns = [
                { title: "#", field: "index" },
                { title: "Núm Factura", field: "invoice_number", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item.status === "pagado" ? "green" : item.status === "rechazado" ? "red" : "black"
                    })
                },
                { title: "Núm Presupuesto", field: "estimatate.estimate_number", style: () => ({ textWrap: "nowrap" }) },
                { title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                { title: "Total", field: "total_amount", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ];

            // Normaliza los datos para la tabla (añade índice y campos planos)            
            const normalizedInvoices = (invoices || []).map((e, i) => ({
                ...e,
                index: i + 1,
                "estimatate.estimate_number": e.estimate?.estimate_number || "N/A",
                "client.name": e.estimate?.client?.name || "N/A",
                "project.name": e.estimate?.project?.name || "N/A",
                "user.name": e.user?.name || "N/A",
            }));

            if (invoices.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Facturas"),
                m(TableListComponent, {
                    columns: columns,
                    data: normalizedInvoices,
                    onRowClick: onSelect
                },
                    //[m(ButtonComponent, { type: "submit", bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" }, actions: () => m.route.set("/invoices/create") }, ["Crear Factura"] ),]
                ),
                m(ModalDetailsComponent, {
                    invoice: selectedInvoice,
                }),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteInvoice",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el factura con #${selectedInvoice?.invoice_number}?`,
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

    function sortData() {
        if (!sortState.campo) return;
        filteredData = [...filteredData].sort((a, b) => {
            const valA = a[sortState.campo];
            const valB = b[sortState.campo];
            if (typeof valA === "string") {
                return sortState.tipo === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            } else {
                return sortState.tipo === "asc" ? valA - valB : valB - valA;
            }
        });
    }

    function orderData(campo) {
        if (sortState.campo === campo) {
            sortState.tipo = sortState.tipo === "asc" ? "desc" : "asc";
        } else {
            sortState.campo = campo;
            sortState.tipo = "asc";
        }
        sortData();
        m.redraw();
    }

    function filterData(value) {
        searchValue = value;
        filteredData = localData.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(value.toLowerCase())
            )
        );
        sortData();
        m.redraw();
    }

    return {
        oninit: ({ attrs }) => {
            localData = [...attrs.data];
            filteredData = [...localData];
        },
        onupdate: ({ attrs }) => {
            if (attrs.data !== localData) {
                localData = [...attrs.data];
                filterData(searchValue);
            }
        },
        view: function ({ attrs, children }) {
            const { columns = [], onRowClick = null } = attrs;

            return m("div", {
                class: "col-11 col-md-10 p-3 rounded",
                style: {
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
                }
            }, [
                m("div", { class: `d-flex flex-column flex-md-row  mb-3 gap-3 ${children && children.length ? "justify-content-between" : "justify-content-end"}` }, [
                    children,
                    m("div.input-group", { style: { maxWidth: "400px" } }, [
                        m("input", {
                            class: "form-control px-3 py-2 me-2 rounded-pill",
                            style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
                            placeholder: "Buscar...",
                            value: searchValue,
                            oninput: e => filterData(e.target.value)
                        }),
                        m("button", {
                            class: "btn btn-outline-secondary rounded-pill fw-normal",
                            style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" }
                        }, m("i.fa.fa-search"))
                    ])
                ]),
                m("div.table-responsive", [
                    m("table", { class: "table table-hover table-striped" }, [
                        m("thead", { class: "py-5 bg-light sticky-top" }, [
                            m("tr", columns.map(col =>
                                m("th.text-nowrap.px-4.py-3", {
                                    style: { cursor: "pointer" },
                                    onclick: () => orderData(col.field)
                                }, [
                                    col.title,
                                    m("i.fa.fa-sort.ms-2")
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
            const { invoice = [] } = attrs;
 
            // Cálculo de subtotales
            const subtotalMaterials = (invoice?.estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0);
            const subtotalLabors = (invoice?.estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0);
            const subtotal = subtotalMaterials + subtotalLabors;


            // Columnas para tablas
            const columnsInvoice = [
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "pagado" ? "green" : item?.status === "rechazado" ? "red" : "black"
                    })
                },
                { title: "Núm Presupuesto", field: "estimatate.estimate_number", style: () => ({ textWrap: "nowrap" }) },

                //{ title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "project.name" },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },
            ];

            const columnsClient = [
                { title: "Nombre", field: "name" },
                { title: "NIF", field: "nif" },
                { title: "Telefono", field: "phone" },
                { title: "Email", field: "email" },
                { title: "Dirección", field: "address" },
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
                { title: "Descripción", field: "description" },
                { title: "Horas", field: "hours" },
                { title: "P / H", field: "cost_per_hour", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_cost", euroSign: "€" },
            ];

            // Normalización de datos
            const normalizedMaterials = (invoice?.estimate?.materials || []).map((m, i) => ({
                ...m,
                index: i + 1,
                "material.name": m?.material?.name || "N/A",
                "quantity": (`${m.quantity} ${m.material?.unit}`) || "N/A",
                "unit_price": m.unit_price || "N/A",
                "discount": m.discount || "N/A",
                "total_price": m.total_price || "N/A",
            }))

            const normalizedLabors = (invoice?.estimate?.labors || []).map((l, i) => ({
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
                                                m(`td.px-4${col.field === 'description' ? '' : '.text-nowrap'}`, {
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
                    m("h6", `IVA: ${Number(invoice?.estimate?.iva || 0)}%`),
                    m("h5.fw-bold", `Total: ${Number(invoice?.total_amount || 0).toFixed(2)} €`)
                ]);

            // Header con botones
            const ContentHeaderModal = () => [
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteInvoice")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Factura"
                ]),
                /* 
                    No se puede editar la factura es casi ilegal, pero lo dejo por si algunas vez se requiere
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => m.route.set(`/invoices/update/${invoice.invoice_number}`)
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Factura"
                ]) */
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
                    Table({ columns: columnsInvoice, data: [invoice] }),
                    m("h5.mt-3", "Detalles del cliente"),
                    Table({ columns: columnsClient, data: [invoice?.estimate?.client] }),
                    m("hr"),
                    m("h5.mt-3", "Conceptos"),
                    m("hr"),
                    m("h5.mt-3", "Materiales"),
                    Table({ columns: columnsMaterials, data: normalizedMaterials }),
                    m("h5.mt-3", "Mano de Obra"),
                    Table({ columns: columnsLabors, data: normalizedLabors }),
                    TableFooter()
                ]);

            // Footer con botón de PDF
            const ContentFooterModal = () =>
                m(ButtonComponent, {
                    //actions: () => GeneratePDF(invoice),
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ]);

            // Render del modal
            return m(ModalComponent, {
                idModal: "ModalDetailsInvoicesList",
                title: `Factura #${invoice?.invoice_number}`,
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

