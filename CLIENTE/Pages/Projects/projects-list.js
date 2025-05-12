import { ModalComponent, ModalConfirmation, ButtonComponent } from "../../Util/generalsComponents.js";


// IMPORTADOR DE FUNCIONES
import { fetchProjects, fetchClients, updateProject, createProject, deleteProject } from "../../Services/services.js";
import { filterList } from "../../Util/util.js";

export function ProjectsListPage() {
    let projects = [];
    let selectedProject = null;

    async function loadProjects() {
        projects = (await fetchProjects()).data;
        console.log(projects);
        m.redraw();
    }

    return {
        oncreate: loadProjects,
        //onupdate: loadProjects,
        view: function () {
            const onSelect = (client) => {
                selectedProject = client;
                new bootstrap.Modal(document.getElementById("ModalDetailsProjectsList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedProject) {
                    await deleteProject(selectedProject.project_id);
                    selectedProject = null;
                    await loadProjects();
                }
            };

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

            const normalizedProjects = (projects || []).map((e, i) => ({
                ...e,
                index: i + 1,
                "client.name": e?.client?.name || " "
            }));


            if (projects.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Proyectos"),
                m(TableListComponent, {
                    columns: columns,
                    data: normalizedProjects,
                    onRowClick: onSelect
                }, [m(ButtonComponent,
                    {
                        type: "submit",
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                        actions: () => {
                            selectedProject = null;
                            //m.route.set("/projects/create")
                            new bootstrap.Modal(document.getElementById("ModalFormProject")).show();
                            m.redraw();
                        }
                    },
                    ["Crear Proyecto"]
                ),]),
                m(ModalDetailsComponent, {
                    selectedProject: selectedProject,
                }),
                m(ModalFormComponent, {
                    selectedProject: selectedProject,
                    onProjectSaved: loadProjects
                }
                ),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteProject",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el proyecto ${selectedProject?.name}?`,
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
            const { selectedProject = {}, } = attrs;

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
                { title: "Descripción", field: "description" },
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
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteProject")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Project"
                ]),
                m(ButtonComponent, {
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
                    m("hr"),
                    m("h5.mt-3", "Cliente propietario"),
                    Table({ columns: columnsClient, data: [selectedProject?.client] }),
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
                console.log("state.selectedProject: ", state.selectedProject);
            }
        },

        view: function ({ attrs }) {


            const handleFormSubmit = async (e) => {
                e.preventDefault()
                const dataToSend = state.ProjectData
                console.log("dataToSend: ", dataToSend);
                //console.log("Se envió");

                try {
                    let response;
                    if (!!state.selectedProject) {
                        response = await updateProject(dataToSend, state.selectedProject?.project_id);
                    } else {
                        response = await createProject(dataToSend);
                    }
                    console.log("Response form: ", response)

                    Toastify({
                        text: "¡Operación exitosa!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                    attrs.onProjectSaved?.(); // Llama al callback si existe

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
                            // Cliente filter
                            m("div", { class: "col-12 d-flex flex-column align-items-start py-2" }, [
                                m("label.form-label.ps-1", "Flitrar cliente *"),
                                m("div.input-group.flex-nowrap", [
                                    m("input.form-control", {
                                        style: { ...style._input_main },
                                        value: state.filterClients || "",
                                        placeholder: "Clientes...",
                                        oninput: e => {
                                            state.filterClients = e.target.value
                                            m.redraw()
                                        }
                                    }),
                                    m("span.input-group-text", {
                                        style: { ...style._input_main },
                                        onclick: e => e.target.closest(".input-group").querySelector("input").focus()
                                    }, m("i.fa", { class: "fa-magnifying-glass" }))
                                ])
                            ]),
                            // Cliente input
                            m("div", { class: "col-12   py-1" }, [
                                m("label.form-label.ps-1", "Cliente *"),
                                m("select.form-select", {
                                    class: (badForm ? " is-invalid" : ""),
                                    required: true,
                                    style: { ...style._input_secondary },
                                    id: "client_id",
                                    value: state.ProjectData?.client_id,
                                    onchange: e => {
                                        state.ProjectData.client_id = e.target.value
                                        console.log("input select: ", state.ProjectData?.client_id)
                                        m.redraw()
                                    },
                                }, [
                                    m("option", { value: "", disabled: true, selected: !state.ProjectData?.client_id }, "-- Selecciona Cliente --"),
                                    ...(Array.isArray(state.clients) ? filterList(state.clients, state.filterClients) : []).map(opt =>
                                        m("option", { value: opt.client_id }, opt.name || opt.content)
                                    )
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
                                m(ButtonComponent, {
                                    closeModal: true,
                                    bclass: "btn-danger ",
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2"), "Cancelar",]),
                                m(ButtonComponent, {
                                    type: "submit",
                                    closeModal: true,
                                    style: { backgroundColor: "var(--mainPurple)" }
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                            ])
                        ])

                    ])]])

            // Render del modal
            return m(ModalComponent, {
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
