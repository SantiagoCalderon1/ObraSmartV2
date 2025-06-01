import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Table } from "../../components/table.js"
import { Button } from "../../components/button.js";

// IMPORTADOR DE FUNCIONES
import { fetchClients, updateClient, createClient, deleteClient } from "../../Services/services.js";
import { SpinnerLoading } from "../../components/spinner-loading.js";
import { TableModal } from "../../components/table-modal.js";

export function ClientsListPage() {
    let clients = [];
    let selectedClient = null;
    let lastUpdated = Date.now()

    async function loadClients() {
        clients = (await fetchClients()).data;
        lastUpdated = Date.now()

        m.redraw();
    }
    return {
        oncreate: loadClients,
        view: function () {
            const onSelect = (client) => {
                selectedClient = client;
                new bootstrap.Modal(document.getElementById("ModalDetailsClientsList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedClient) {
                    try {
                        let response = await deleteClient(selectedClient.nif)
                        if (response) {
                            Toastify({
                                text: "¡Operación exitosa!",
                                className: "toastify-success",
                                duration: 3000,
                                close: true,
                                gravity: "top",
                                position: "right"
                            }).showToast()
                        }
                    } catch (error) {
                        Toastify({
                            text: "¡Algo salió mal!",
                            className: "toastify-error",
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right"
                        }).showToast()
                    } finally {
                        selectedClient = null;
                        await loadClients(); m.redraw()
                    }
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

            if (clients.length === 0) { return m(SpinnerLoading) }

            return [
                m("h1.py-5.text-uppercase", "Clientes"),
                m("div.col-10.d-flex.justify-content-center.align-items-center", { style: { maxWidth: "1400px" } }, [
                    m(Table, {
                        key: lastUpdated,
                        columns: columns,
                        data: normalizedClients,
                        onRowClick: onSelect,
                        style: { height: "70vh", width: "100%" }
                    }, [m(Button,
                        {
                            type: "submit",
                            bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                            style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: () => {
                                selectedClient = null;
                                new bootstrap.Modal(document.getElementById("ModalFormClient")).show();
                                m.redraw();
                            }
                        },
                        ["Crear Cliente"]
                    ),]),
                ]),
                m(ModalDetailsComponent, {
                    selectedClient: selectedClient,
                }),
                m(ModalFormComponent, {
                    selectedClient: selectedClient,
                    onClientSaved: loadClients
                }),
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

            // Header con botones
            const ContentHeaderModal = () => [
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteClient")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Cliente"
                ]),
                m(Button, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => {
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
                m("div", { style: { maxHeight: "60vh", overflowY: "auto", padding: "1rem" } }, [
                    m("h5.mt-1", "Detalles"),
                    m(TableModal, { columns: columnsClient, data: [selectedClient] }),
                    m("hr"),
                    m("h5.mt-3", "Proyectos"),
                    m(TableModal, { columns: columnsProyects, data: normalizedProjects }),
                ]);

            return m(Modal, {
                idModal: "ModalDetailsClientsList",
                title: `Cliente con NIF ${selectedClient?.nif}`,
                addBtnClose: true,
                slots: {
                    header: ContentHeaderModal(),
                    body: ContentBodyModal(),
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

    let formElement

    return {
        oninit: ({ attrs }) => {
            state.selectedClient = attrs.selectedClient;
            state.ClientData = ClientData(attrs.selectedClient || {});
        },
        onupdate: ({ attrs }) => {
            if (attrs.selectedClient !== state.selectedClient) {
                state.selectedClient = attrs.selectedClient;
                state.ClientData = ClientData(state.selectedClient || {});
            }
        },
        view: function ({ attrs }) {

            const handleFormSubmit = async () => {
                const dataToSend = state.ClientData
                try {
                    let response;
                    if (!!state.selectedClient) {
                        response = await updateClient(dataToSend, state.selectedClient.client_id);
                    } else {
                        response = await createClient(dataToSend);
                    }

                    const modalElement = document.getElementById("ModalFormClient");
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement);
                        modalInstance.hide();
                    }

                    if (response) {
                        Toastify({
                            text: "¡Operación exitosa!",
                            className: "toastify-success",
                            duration: 3000,
                            close: true,
                            gravity: "top",
                            position: "right"
                        }).showToast()
                    }
                } catch (error) {
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                } finally {
                    attrs.onClientSaved?.(); // Llama al callback si existe
                    m.redraw()
                    state.ClientData = ClientData()
                }
            }

            const ContentBodyModal = () =>
                m("form", {
                    class: "row col-12",
                    onsubmit: handleFormSubmit,
                    oncreate: ({ dom }) => {
                        formElement = dom
                    }
                }, [
                    [m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Datos del cliente"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
                            // Nombre
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
                            // Espacio en blanco
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
                                    type: "email",
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
                                m(Button, {
                                    closeModal: true,
                                    bclass: "btn-danger",
                                    actions: () => {
                                        state.ClientData = ClientData()
                                        m.redraw()
                                    }
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar",]),
                                m(Button, {
                                    type: "submit",
                                    actions: async (e) => {
                                        e.preventDefault()
                                        if (!formElement.checkValidity()) {
                                            formElement.reportValidity();
                                            return;
                                        }
                                        await handleFormSubmit();
                                    },
                                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" },
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                            ])
                        ])
                    ])]])

            return m(Modal, {
                idModal: "ModalFormClient",
                maxHeight: false,
                title: state.selectedClient?.nif ? `Actualizando el cliente` : `Creando Nuevo Cliente`,
                addBtnClose: false,
                slots: {
                    body: ContentBodyModal(),
                }
            });
        }
    };
}
