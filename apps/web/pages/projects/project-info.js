import Choices from 'choices.js';

// IOMPORTADOR DE COMPONENTES REUTILIZABLES
import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Table } from "../../components/table.js"
import { Button } from "../../components/button.js";




// IMPORTADOR DE FUNCIONES
import { fetchProject, fetchClients, updateProject, createProject, deleteProject } from "../../Services/services.js";

export function ProjectInfoPage() {
    let project = {};

    async function loadProject(id = "") {
        project = (await fetchProject(id)).data;

        if (project?.invoices?.length && project?.estimates?.length) {
            console.log("Project invoices: ", project.invoices);
            console.log("Project estimates: ", project.estimates);
            
            project.invoices = project.invoices.map(invoice => {
                const relatedEstimate = project.estimates.find(est => est.estimate_id === invoice.estimate_id);
                return { ...invoice, estimate: relatedEstimate };
            });
        }

        if (project?.invoices?.length) {
            project.invoices = project.invoices.map(invoice => ({
                ...invoice,
                client: project.client,  //  Cliente del proyecto
                proyectName: project.name
            }));
        }



        console.log(project);
        m.redraw();
    }

    return {
        oncreate: function ({ attrs }) {
            loadProject(attrs.id)
        },
        //onupdate: loadProject,
        view: function () {

            const columns = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "completado" ? "green" : item?.status === "cancelado" ? "red" : "black"
                    })
                },
                { title: "Cliente", field: "client.name", style: () => ({ textWrap: "nowrap" }) },
                //{ title: "Descripción", field: "description" },
                { title: "Fecha de inicio", field: "start_date", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha de fin", field: "end_date", style: () => ({ textWrap: "nowrap" }) },
            ];




            if (loadProject == {}) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            const PageEsctructure = ({ smallBoxes = [], largeBoxes = [] }) =>
                m("div.container", [
                    m("div.row", [
                        // Pequeñas (izquierda)
                        m("div.col-12.col-md-6", [
                            m("div.row", [
                                ...smallBoxes.map((boxContent, i) =>
                                    m("div.col-6.mb-3", [
                                        m("div.p-3.bg-primary.text-white.text-center.rounded", boxContent)
                                    ])
                                )
                            ])
                        ]),

                        // Grandes (derecha)
                        m("div.col-12.col-md-6", [
                            m("div.row", [
                                ...largeBoxes.map((boxContent, i) =>
                                    m("div.col-12.mb-3.d-flex.justify-content-center.align-items-center.flex-column", [
                                        boxContent
                                    ])
                                )
                            ])
                        ])
                    ])
                ]);


            return [
                m("h1.py-5.text-uppercase", `Detalles del presupuesto ${project?.name}`),
                PageEsctructure({
                    smallBoxes: [
                        m("span", "Caja 1"),
                        m("span", "Caja 2"),
                        m("span", "Caja 3"),
                        m("span", "Caja 4"),
                    ],
                    largeBoxes: [
                        // SECCION DE PRESUPUESTOS
                        m(EstimatesList, { estimates: project?.estimates }),
                        m(InvoicesList, { invoices: project?.invoices }),

                    ]
                }),

                m(ModalFormComponent, {
                    selectedProject: project,
                    onProjectSaved: loadProject
                }),


            ];
        }
    };
}

function ModalProjectDetailsComponent() {
    return {

        view: function ({ attrs }) {
            const { selectedProject = {}, } = attrs;
            console.log("selectedProject: ", selectedProject);

            // Columnas para tablas
            const columnsProject = [
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        textWrap: "nowrap",
                        color: item?.status === "completado" ? "green" : item?.status === "cancelado" ? "red" : "black"
                    })
                },
                { title: "Cliente", field: "client.name", style: () => ({ textWrap: "nowrap" }) },
                //{ title: "Descripción", field: "description" },
                { title: "Fecha de inicio", field: "start_date", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha de fin", field: "end_date", style: () => ({ textWrap: "nowrap" }) },
            ];

            const columnsClient = [
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                { title: "NIF", field: "nif", style: () => ({ textWrap: "nowrap" }) },
                { title: "Telefono", field: "phone", style: () => ({ textWrap: "nowrap" }) },
                { title: "Email", field: "email", style: () => ({ textWrap: "nowrap" }) },
                { title: "Dirección", field: "address", style: () => ({ textWrap: "nowrap" }) },
            ];

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
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteProject")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Project"
                ]),
                m(Button, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => {
                        //m.route.set(`/projects/update/${selectedProject.project_id}`)
                        //m.route.set("/projects/create")
                        new bootstrap.Modal(document.getElementById("ModalFormProject")).show();
                        m.redraw();
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Project"
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
                    Table({ columns: columnsProject, data: [selectedProject] }),
                    m("div.py-3", [
                        m("h5", "Descripción"),
                        m("p", selectedProject?.description),
                    ]),
                    m("hr"),
                    m("h5.mt-3", "Cliente propietario"),
                    Table({ columns: columnsClient, data: [selectedProject?.client] }),
                ]);

            // Footer con botón de PDF
            const ContentFooterModal = () => [
                m(Button, {
                    //actions: () => GeneratePDF(estimate),
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ]),
                m(Button, {
                    closeModal: true,
                    actions: () => m.route.set(`/projects/${selectedProject?.name}`),
                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                    style: { backgroundColor: "var(--mainPurple)" },
                }, [
                    "Ver todos los detalles "
                ]),
            ]

            // Render del modal
            return m(Modal, {
                idModal: "ModalDetailsProjectsList",
                title: `Project - ${selectedProject?.name}`,
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
    const status = [{ value: "completado" }, { value: "en proceso" }, { value: "cancelado" },]
    let badForm = false
    const today = new Date().toISOString().split("T")[0]
    let formElement = null;

    const ProjectData = ({
        client_id = "",
        name = "",
        description = "",
        status = "en proceso",
        start_date = "",
        end_date = "",
    } = {}) => ({
        client_id,
        name,
        description,
        status,
        start_date,
        end_date,
    })

    const state = {
        ProjectData: ProjectData(),
        selectedProject: null,
        clients: [],
        filterClients: "",
    }


    return {
        oninit: async ({ attrs }) => {
            state.selectedProject = attrs.selectedProject;
            state.ProjectData = ProjectData(attrs.selectedProject || {});
            state.clients = (await fetchClients()).data

        },
        onupdate: ({ attrs }) => {
            if (attrs.selectedProject !== state.selectedProject) {
                state.selectedProject = attrs.selectedProject;
                state.ProjectData = ProjectData(state.selectedProject || {});
                //console.log("state.selectedProject: ", state.selectedProject);
            }
        },

        view: function ({ attrs }) {


            const handleFormSubmit = async (e) => {
                const dataToSend = state.ProjectData
                //console.log("dataToSend: ", dataToSend);
                //console.log("Se envió");

                try {
                    let response;
                    if (!!state.selectedProject) {
                        response = await updateProject(dataToSend, state.selectedProject?.project_id);
                    } else {
                        response = await createProject(dataToSend);
                    }
                    //console.log("Response form: ", response)

                    Toastify({
                        text: "¡Operación exitosa!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                    attrs.onProjectSaved?.(); // Llama al callback si existe

                    const modalElement = document.getElementById("ModalFormProject");
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement);
                        modalInstance.hide();
                    }

                } catch (error) {
                    //console.error("Error al enviar el formulario:", error)
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
                    onsubmit: handleFormSubmit,
                    oncreate: (vnode) => {
                        formElement = vnode.dom;
                    }
                }, [
                    [m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Datos del proyecto"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-evenly  " }, [
                        // Datos Projecto
                        m("div", { class: "row col-xl-8" }, [
                            m("div", { class: "col-md-12 pt-2" }, [
                                m("label.form-label.ps-1", `Nombre *`),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ProjectData.name,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ProjectData.name = e.target.value
                                })
                            ]),
                            // Espacio en blanco
                            //m("div.col-md-3.pt-2"),
                            // Estado
                            m("div.col-md-12.col-lg-4.pt-2", [
                                m("label.form-label.ps-1", "Estado *"),
                                m("select.form-select", {
                                    class: (badForm ? " is-invalid" : ""),
                                    required: true,
                                    style: { ...style._input_secondary },
                                    id: "status",
                                    value: state.ProjectData?.status || "en proceso",
                                    onchange: e => { state.ProjectData.status = e.target.value; m.redraw() }
                                }, [
                                    ...status.map(opt =>
                                        m("option", { value: opt.value }, opt.value)
                                    )
                                ])
                            ]),


                            // Fecha de creación
                            m("div.col-md-12.col-lg-4.pt-2", [

                                m("label.form-label.ps-1", "Fecha de inicio *"),
                                m("input.form-control", {
                                    class: (badForm ? " is-invalid" : ""),
                                    required: true,
                                    style: { ...style._input_secondary },
                                    type: "date",
                                    value: state.ProjectData?.start_date || today,
                                    max: today,
                                    oninput: e => { state.ProjectData.start_date = e.target.value; m.redraw() }
                                })

                            ]),
                            // Fecha de expiración
                            m("div.col-md-12.col-lg-4.pt-2", [
                                m("label.form-label.ps-1", "Fecha de fin *"),
                                m("input.form-control", {
                                    class: (badForm ? " is-invalid" : ""),
                                    required: true,
                                    style: { ...style._input_secondary },
                                    type: "date",
                                    value: state.ProjectData?.end_date || today,
                                    min: today,
                                    oninput: e => { state.ProjectData.end_date = e.target.value; m.redraw() }
                                })
                            ]),

                        ]),
                        // Cliente
                        m("div", { class: "row col-xl-4 " }, [

                            // Cliente input
                            m("div", { class: "col-12 py-1" }, [
                                m("label.form-label.ps-1", "Cliente *"),
                                m("select.form-select", {
                                    class: badForm ? "is-invalid" : "",
                                    required: true,
                                    style: { ...style._input_secondary },
                                    id: "client_id",
                                    value: state.ProjectData?.client_id,
                                    onchange: e => {
                                        state.ProjectData.client_id = e.target.value;
                                        m.redraw();
                                    },
                                    oncreate: ({ dom }) => {
                                        if (Array.isArray(state.clients) && state.clients.length > 0) {
                                            dom.choicesInstance = new Choices(dom, {
                                                allowHTML: false,
                                                shouldSort: false,
                                                searchPlaceholderValue: "Buscar cliente...",
                                                itemSelectText: '',
                                            });
                                            dom.choicesInstance.setChoiceByValue(state.ProjectData?.client_id);
                                        }
                                    },
                                    onupdate: ({ dom }) => {
                                        if (!dom.choicesInstance && Array.isArray(state.clients) && state.clients.length > 0) {
                                            dom.choicesInstance = new Choices(dom, {
                                                allowHTML: false,
                                                shouldSort: false,
                                                searchPlaceholderValue: "Buscar cliente...",
                                                itemSelectText: '',
                                            });
                                        }
                                    },

                                }, [
                                    m("option", {
                                        value: "",
                                        disabled: true,
                                        selected: !state.ProjectData?.client_id
                                    }, "-- Selecciona Cliente --"),
                                    ...(Array.isArray(state.clients)
                                        ? state.clients.map(opt =>
                                            m("option", {
                                                value: opt.client_id
                                            }, opt.name || opt.content || "Sin nombre")
                                        )
                                        : [])
                                ])
                            ]),
                        ]),
                        // Descripcion
                        m("div", { class: "row" }, [
                            m("div.pt-2",
                                m("label.form-label.ps-1", "Descripción *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.ProjectData.description,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.ProjectData.description = e.target.value
                                })
                            )
                        ]),
                        // Botones
                        m("div.col-12.d-flex.justify-content-center.my-5", [
                            m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                                m(Button, {
                                    closeModal: true,
                                    bclass: "btn-danger",
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
                                    style: { backgroundColor: "var(--mainPurple)" }
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                            ])
                        ])

                    ])]])

            // Render del modal
            return m(Modal, {
                idModal: "ModalFormProject",
                title: state.selectedProject?.project_id ? `Actualizando el cliente` : `Creando Nuevo Project`,
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

// SECCION DE PRESUPUESTOS
function EstimatesList() {
    let selectedEstimate = null;

    return {
        view: function ({ attrs }) {
            const { estimates = [] } = attrs;

            const onSelect = (estimate) => {
                selectedEstimate = estimate;
                new bootstrap.Modal(document.getElementById("ModalDetailsEstimatesList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedEstimate) {
                    await deleteEstimate(selectedEstimate.estimate_id);
                    selectedEstimate = null;
                }
            };

            const columns = [
                { title: "#", field: "index" },
                { title: "Núm Presupuesto", field: "estimate_number", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item.status === "Aceptado" ? "green" : item.status === "Rechazado" ? "red" : "black"
                    })
                },

                { title: "Total", field: "total_cost", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                { title: "Fecha creación", field: "issue_date" },
                { title: "Fecha Expiración", field: "due_date" },

            ];

            // Normaliza los datos para la tabla (añade índice y campos planos)            
            const normalizedEstimates = (estimates || []).map((e, i) => ({
                ...e,
                index: i + 1,
            }));

            if (normalizedEstimates.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Presupuestos"),
                m(Table, {
                    columns: columns,
                    data: normalizedEstimates,
                    onRowClick: onSelect,
                    maxHeightTable: "20vh",
                    offset: ""
                }, [m(Button,
                    {
                        type: "submit",
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                        actions: () => m.route.set("/estimates/create")
                    },
                    ["Crear Presupuesto"]
                ),]),
                m(ModalEstimatesDetailsComponent, {
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

function ModalEstimatesDetailsComponent() {
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
                        color: item?.status === "Aceptado" ? "green" : item?.status === "Rechazado" ? "red" : "black"
                    })
                },

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
                { title: "Descripción", field: "description" },
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
                    m("h6", `IVA: ${Number(estimate?.iva || 0)}%`),
                    m("h5.fw-bold", `Total: ${Number(estimate?.total_cost || 0).toFixed(2)} €`)
                ]);

            // Header con botones
            const ContentHeaderModal = () => [
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteEstimate")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Presupuesto"
                ]),
                m(Button, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => m.route.set(`/estimates/update/${estimate.estimate_number}`)
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
                    m("hr"),
                    m("h5.mt-3", "Conceptos"),
                    m("hr"),
                    m("h5.mt-3", "Materiales"),
                    Table({ columns: columnsMaterials, data: normalizedMaterials }),
                    m("h5.mt-3", "Mano de Obra"),
                    Table({ columns: columnsLabors, data: normalizedLabors }),
                    m("div.mt-3", [m("span.fw-bold", "Condiciones: "), (estimate?.conditions || "N/A")]),
                    TableFooter()
                ]);

            // Footer con botón de PDF
            const ContentFooterModal = () => [
                m(Button, {
                    //actions: () => GeneratePDF(estimate),
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ]),
                estimate?.status === "Aceptado" ? m(Button, {
                    bclass: "btn text-white fc-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                    actions: () => m.route.set(`/invoices/create/${estimate?.estimate_number}`),
                    closeModal: true
                }, [
                    "Generar Factura ",
                    m("i.fa-solid.fa-file-invoice-dollar", { style: { color: "white" } })
                ]) : null,
            ]

            // Render del modal
            return m(Modal, {
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


// SECCION DE FACTURAS
function InvoicesList() {
    let selectedInvoice = null;


    return {
        view: function ({ attrs }) {
            const { invoices = [] } = attrs

            const onSelect = (invoice) => {
                selectedInvoice = invoice;
                new bootstrap.Modal(document.getElementById("ModalDetailsInvoicesList")).show();
                m.redraw();
            };

            const handleInvoiceAction = async (action) => {
                if (!selectedInvoice) return;
                try {
                    switch (action) {
                        case "delete":
                            await deleteInvoice(selectedInvoice.invoice_id);
                            break;
                        case "pay":
                            await updateInvoice({ status: "pagado" }, selectedInvoice.invoice_id);
                            break;
                        case "rejected":
                            await updateInvoice({ status: "rechazado" }, selectedInvoice.invoice_id);
                            break;
                    }
                    selectedInvoice = null;
                    m.redraw()

                    Toastify({
                        text: "¡Operación exitosa!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()

                } catch (error) {
                    //console.error("Error al enviar el formulario:", error)
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
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
            const normalizedInvoices = invoices.map((e, i) => ({
                ...e,
                index: i + 1,

            }));

            if (normalizedInvoices.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Facturas"),
                m(Table, {
                    columns: columns,
                    data: normalizedInvoices,
                    onRowClick: onSelect,
                    maxHeightTable: "20vh",
                    offset: ""
                },
                    //[m(Button, { type: "submit", bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" }, actions: () => m.route.set("/invoices/create") }, ["Crear Factura"] ),]
                ),
                m(ModalInvoicesDetailsComponent, {
                    invoice: selectedInvoice,
                }),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteInvoice",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el factura con #${selectedInvoice?.invoice_number}?`,
                    actions: () => handleInvoiceAction("delete")
                }),
                m(ModalConfirmation, {
                    idModal: "ModalUpdatePagadoInvoice",
                    tituloModal: "Confirmación de actualización",
                    mensaje: `¿Está seguro de actualizar el estado a PAGADO de la factura con #${selectedInvoice?.invoice_number}?`,
                    actions: () => handleInvoiceAction("pay")
                }),
                m(ModalConfirmation, {
                    idModal: "ModalUpdateRechazadoInvoice",
                    tituloModal: "Confirmación de actualización",
                    mensaje: `¿Está seguro de actualizar el estado a RECHAZADO de la factura con #${selectedInvoice?.invoice_number}?`,
                    actions: () => handleInvoiceAction("rejected")
                }),
            ];
        }
    };
}


function ModalInvoicesDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { invoice = [] } = attrs;
            console.log("invoice: ", invoice);

            // Cálculo de subtotales
            const subtotalMaterials = (invoice?.estimate?.materials || []).reduce((sum, item) => sum + Number(item.total_price || 0), 0);
            const subtotalLabors = (invoice?.estimate?.labors || []).reduce((sum, item) => sum + Number(item.total_cost || 0), 0);
            const subtotal = subtotalMaterials + subtotalLabors;


            // Columnas para tablas
            const columnsInvoice = [
                { title: "Núm Presupuesto", field: "estimate.estimate_number", style: () => ({ textWrap: "nowrap" }) },
                //{ title: "Cliente", field: "client.name" },
                { title: "Proyecto", field: "proyectName" },
                {
                    title: "Estado", field: "status", style: (item) => ({
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        color: item?.status === "pagado" ? "green" : item?.status === "rechazado" ? "red" : "black"
                    })
                },
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

            const normalizedInvoice = {
                ...invoice,
                "estimate.estimate_number": invoice?.estimate?.estimate_number || "N/A"
            };

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
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteInvoice")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Factura"
                ]),
            ]

            const ButtonsActions = () => [
                /* 
    No se puede editar la factura es casi ilegal, pero lo dejo por si algunas vez se requiere
    Lo que si se puede cambiar es el estado, de pendiente a aceptado  o rechazado, pero no al reves   
*/
                invoice?.status === "pendiente" ? [
                    m("h5.text-center.pt-3", "Actualizar Estado"),
                    m("div.d-flex.justify-content-evenly.pb-3", [
                        m(Button, {
                            closeModal: true,
                            bclass: "btn-outline-danger",
                            actions: () =>
                                new bootstrap.Modal(document.getElementById("ModalUpdateRechazadoInvoice")).show()
                        }, [
                            m("i.fa-solid.fa-pen-to-square.text-danger"),
                            " RECHAZADO"
                        ]),
                        m(Button, {
                            closeModal: true,
                            bclass: "btn-outline-success",
                            actions: () =>
                                new bootstrap.Modal(document.getElementById("ModalUpdatePagadoInvoice")).show()
                        }, [
                            m("i.fa-solid.fa-pen-to-square.text-success"),
                            " PAGADO"
                        ])
                    ])
                ] : null
            ]

            // Body con las dos tablas
            const ContentBodyModal = () =>
                m("div", {
                    style: {
                        maxHeight: "60vh",
                        overflowY: "auto",
                        padding: "1rem"
                    }
                }, [
                    ButtonsActions(),
                    m("h5.mt-1", "Detalles"),
                    m("hr"),
                    Table({ columns: columnsInvoice, data: [normalizedInvoice] }),
                    m("h5.mt-3", "Detalles del cliente"),
                    Table({ columns: columnsClient, data: [invoice?.client] }),
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
                m(Button, {
                    //actions: () => GeneratePDF(invoice),
                    bclass: "btn-outline-danger"
                }, [
                    "Descargar PDF ",
                    m("i.fa-solid.fa-file-pdf.text-danger")
                ]);

            // Render del modal
            return m(Modal, {
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

