import { ModalComponent, ModalConfirmation, ButtonComponent } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchClients, updateClient, createClient, deleteClient } from "../../Services/services.js";

export function ClientsListPage() {
    let clients = [];
    let selectedClient = null;

    async function loadClients() {
        clients = (await fetchClients()).data;
        //console.log(clients);
        m.redraw();
    }

    return {
        oncreate: loadClients,
        //onupdate: loadClients,
        view: function () {
            const onSelect = (client) => {
                selectedClient = client;
                new bootstrap.Modal(document.getElementById("ModalDetailsClientsList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedClient) {
                    await deleteClient(selectedClient.nif);
                    selectedClient = null;
                    await loadClients();
                }
            };

            const columns = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                { title: "NIF", field: "nif" },
                { title: "Telefono", field: "phone", style: () => ({ textWrap: "nowrap" }) },
            ];

            const normalizedClients = (clients || []).map((e, i) => ({
                ...e,
                index: i + 1,
            }));


            if (clients.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Clientes"),
                m(TableListComponent, {
                    columns: columns,
                    data: normalizedClients,
                    onRowClick: onSelect
                }, [m(ButtonComponent,
                    {
                        type: "submit",
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                        actions: () => {
                            selectedClient = null;
                            //m.route.set("/clients/create")
                            new bootstrap.Modal(document.getElementById("ModalFormClient")).show();
                            m.redraw();
                        }
                    },
                    ["Crear Cliente"]
                ),]),
                m(ModalDetailsComponent, {
                    selectedClient: selectedClient,
                }),
                m(ModalFormComponent, {
                    selectedClient: selectedClient,
                    onClientSaved: loadClients
                }
                ),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteClient",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el cliente con NIF ${selectedClient?.nif}?`,
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
                m("div", { class: "d-flex flex-column flex-md-row justify-content-between mb-3 gap-3" }, [
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
            const { selectedClient = {}, } = attrs;

            // Columnas para tablas
            const columnsClient = [
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                { title: "NIF", field: "nif" },
                { title: "Telefono", field: "phone", style: () => ({ textWrap: "nowrap" }) },
                { title: "Email", field: "email", style: () => ({ textWrap: "nowrap" }) },
                { title: "Dirección", field: "address", style: () => ({ textWrap: "nowrap" }) },
            ];

            const columnsProyects = [
                { title: "#", field: "index" },

                { title: "Nombre", field: "name" },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "completado" ? "green" : item?.status === "cancelado" ? "red" : "black"
                    })
                },
                { title: "Fecha de inicio", field: "start_date" },
                { title: "Fecha de finalización", field: "end_date" },
            ];


            const normalizedProjects = (selectedClient?.projects || []).map((m, i) => ({
                ...m,
                index: i + 1,

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
                                                m(`td.px-4`, {
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



            // Header con botones
            const ContentHeaderModal = () => [
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteClient")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Cliente"
                ]),
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => {
                        //m.route.set(`/clients/update/${selectedClient.nif}`)
                        //m.route.set("/clients/create")
                        new bootstrap.Modal(document.getElementById("ModalFormClient")).show();
                        m.redraw();
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Cliente"
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
                    Table({ columns: columnsClient, data: [selectedClient] }),
                    m("hr"),
                    m("h5.mt-3", "Proyectos"),
                    Table({ columns: columnsProyects, data: normalizedProjects }),
                ]);

            // Footer con botón de PDF
            const ContentFooterModal = () => [
                m(ButtonComponent, {
                    //actions: () => GeneratePDF(estimate),
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ]),
            ]

            // Render del modal
            return m(ModalComponent, {
                idModal: "ModalDetailsClientsList",
                title: `Cliente con NIF ${selectedClient?.nif}`,
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


function ModalFormComponent() {
    let style = {
        _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
        _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
    }

    const ClientData = ({
        name = "",
        nif = "",
        phone = "",
        email = "",
        address = "",
    } = {}) => ({
        name,
        nif,
        phone,
        email,
        address,
    })

    const state = {
        ClientData: ClientData(),
        selectedClient: null
    }


    return {
        oninit: ({ attrs }) => {
            state.selectedClient = attrs.selectedClient;
            state.ClientData = ClientData(attrs.selectedClient || {});
        },
        onupdate: ({ attrs }) => {
            if (attrs.selectedClient !== state.selectedClient) {
                state.selectedClient = attrs.selectedClient;
                state.ClientData = ClientData(state.selectedClient || {});
                //console.log("state.selectedClient: ", state.selectedClient);
            }
        },

        view: function ({ attrs }) {


            const handleFormSubmit = async (e) => {
                e.preventDefault()
                const dataToSend = state.ClientData
                console.log("dataToSend: ", dataToSend);
                //console.log("Se envió");

                try {
                    let response;
                    if (!!state.selectedClient) {
                        response = await updateClient(dataToSend, state.selectedClient.client_id);
                    } else {
                        response = await createClient(dataToSend);
                    }
                    console.log("Response form: ", response)

                    const modalElement = document.getElementById("ModalFormClient");
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement);
                        modalInstance.hide();
                    }

                    Toastify({
                        text: "¡Operación exitosa!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                    attrs.onClientSaved?.(); // Llama al callback si existe

                } catch (error) {
                    console.error("Error al enviar el formulario:", error)
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                } finally {
                    m.redraw()
                }
            }
            const ContentBodyModal = () =>
                m("form", {
                    class: "row col-12",
                    onsubmit: handleFormSubmit
                }, [
                    [m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Datos del cliente"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
                            m("div", { class: "col-md-12 col-lg-6 pt-2" }, [
                                m("label.form-label.ps-1", `Nombre *`),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ClientData.name,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ClientData.name = e.target.value

                                })
                            ]),
                            // NIF
                            m("div.col-md-12.col-lg-3.pt-2", [
                                m("label.form-label.ps-1", "NIF *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ClientData.nif,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ClientData.nif = e.target.value


                                })
                            ]),
                            m("div.col-md-12.col-lg-3.pt-2"),
                            // PHone
                            m("div.col-md-12.col-lg-3.pt-2", [
                                m("label.form-label.ps-1", "Telefono *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ClientData.phone,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ClientData.phone = e.target.value

                                })
                            ]),
                            // Email
                            m("div.col-md-12.col-lg-4.pt-2", [
                                m("label.form-label.ps-1", "Email *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ClientData.email,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ClientData.email = e.target.value

                                })
                            ]),
                            // address
                            m("div.col-md-12.col-lg-5.pt-2", [
                                m("label.form-label.ps-1", "Dirección *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ClientData.address,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ClientData.address = e.target.value

                                })
                            ]),
                        ]),
                        // Botones
                        m("div.col-12.d-flex.justify-content-center.my-5", [
                            m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                                m(ButtonComponent, {
                                    closeModal: true,
                                    bclass: "btn-danger",
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar",]),
                                m(ButtonComponent, {
                                    type: "submit",
                                    actions: async (e) => {
                                        e.preventDefault()
                                        if (!formElement.checkValidity()) {
                                            formElement.reportValidity();
                                            return;
                                        }
                                        await handleFormSubmit();
                                    },
                                    style: { backgroundColor: "var(--mainPurple)" }
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                            ])
                        ])

                    ])]])

            // Render del modal
            return m(ModalComponent, {
                idModal: "ModalFormClient",
                title: state.selectedClient?.nif ? `Actualizando el cliente` : `Creando Nuevo Cliente`,
                addBtnClose: false,
                slots: {
                    //header: ContentHeaderModal(),
                    body: ContentBodyModal(),
                    //footer: ContentFooterModal()
                }
            });
        }
    };
}
