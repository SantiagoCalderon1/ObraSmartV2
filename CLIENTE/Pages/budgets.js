import { TableListComponent, ModalComponent, ButtonComponent } from "./generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchBudgets, fetchBudgetDetails, fetchClients, fetchProjects, createBudget, updateBudget, deleteBudget } from "../services/budgetsService.js";


function BudgetsPage() {
    return {
        oncreate: () => { window.scrollTo(0, 0); },
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "list":
                    content = m(BudgetsListPage);
                    break;
                case "create":
                    content = m(BudgetFormPage);
                    break;
                case "update":
                    content = m(BudgetFormPage, { typeForm: "update", budget_number: attrs.id });
                    break;
                default:
                    content = m("div", "Vista no encontrada");
            }
            return m("div", { style: { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "var(--secondaryWhite)", paddingBottom: '50px' } }, [
                content
            ]);
        }
    }
}

function BudgetsListPage() {
    let budgets = [];
    let clients = [], projects = []
    let selectedBudget = null;
    let selectedBudgetDetails = null;

    async function loadBudgets() {
        const [rawBudgets, clients, projects] = await Promise.all([
            fetchBudgets(),
            fetchClients(),
            fetchProjects()
        ]);
        const clientMap = Object.fromEntries(clients.map(c => [c.client_id, c.name]));
        const projectMap = Object.fromEntries(projects.map(p => [p.project_id, p.name]));
        budgets = rawBudgets.map(b => ({
            ...b,
            client_name: clientMap[b.client_id] || "Cliente desconocido",
            project_name: projectMap[b.project_id] || "Proyecto desconocido"
        }));
        m.redraw();
    }

    return {
        oncreate: loadBudgets,
        view: function () {
            const onSelect = async (budget) => {
                selectedBudget = budget;
                try {
                    selectedBudgetDetails = await fetchBudgetDetails(budget.budget_id);
                } catch (error) {
                    selectedBudgetDetails = [];
                }
                new bootstrap.Modal(document.getElementById("ModalDetailsBudgetsList")).show();
                m.redraw();
            };


            const onDelete = async () => {
                await deleteBudget(selectedBudget?.budget_id);
                selectedBudget = null;
                selectedBudgetDetails = null;
                await loadBudgets();
                m.redraw()
            };

            return [
                m("h1", { style: { padding: "30px 0", textTransform: "uppercase" } }, "Presupuestos"),
                m(BudgetsListComponent, { budgets, onRowClick: onSelect }),
                m(BudgetModalDetailsComponent, {
                    idModal: "ModalDetailsBudgetsList",
                    tituloModal: `Detalles Presupuesto #${selectedBudget?.budget_number}`,
                    budget: selectedBudget,
                    budgetDetails: selectedBudgetDetails
                }),
                m(BudgetModalConfirmation, {
                    idModal: "ModalDeleteBudget",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el presupuesto con #${selectedBudget?.budget_number}?`,
                    actions: onDelete
                })
            ]
        },
    }
}

function BudgetsListComponent() {
    return {
        view: function ({ attrs }) {
            const { budgets = [], onRowClick } = attrs

            if (budgets.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            const columns = [
                { title: "#", field: "index" },
                { title: "Número Presupuesto", field: "budget_number" },
                {
                    title: "Estado", field: "status", style: (item) => {
                        return {
                            fontWeight: "bold",
                            textTransform: "uppercase",
                            color: item.status === "Aceptado"
                                ? "green"
                                : item.status === "Rechazado"
                                    ? "red"
                                    : "black"
                        }
                    }
                },
                { title: "Cliente", field: "client_name" },
                { title: "Proyecto", field: "project_name" },
                { title: "Total", field: "total", euroSign: "€" },
                { title: "Fecha", field: "date" }
            ];

            return [
                m(TableListComponent, { columns: columns, data: budgets, onRowClick: onRowClick },
                    [m(ButtonComponent, { actions: () => m.route.set("/budget/create/0") }, ["Crear Presupuesto"])]
                )
            ]
        }
    };
}

function BudgetFormPage() {
    return {
        view: function ({ attrs }) {
            const isUpdate = attrs.typeForm === "update";
            const title = isUpdate
                ? `Actualizando el Presupuesto ${attrs.budget_number}`
                : "Nuevo Presupuesto";

            return [
                m("h1.text-center", { style: { padding: "30px 0", textTransform: "uppercase" } }, title),
                m(FormBudgetComponent, {
                    typeForm: attrs.typeForm,
                    budget_number: attrs.budget_number // puede ser `undefined` en creación
                }),
                m(BudgetModalConfirmation, {
                    idModal: "ModalCancelationBudget",
                    tituloModal: "Confirmación de cancelación",
                    mensaje: isUpdate
                        ? "¿Está seguro de cancelar la actualización del presupuesto?"
                        : "¿Está seguro de cancelar la creación del nuevo presupuesto?",
                    actions: () => {
                        m.route.set("/budgets");
                        m.redraw();
                    }
                })
            ];
        }
    }
}

function BudgetModalDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { idModal, tituloModal, budget, budgetDetails = [] } = attrs
            console.log("Budget: ", budget);

            let subtotal = 0
            let totalBudget = 0;
            if (budgetDetails) {
                subtotal = budgetDetails.reduce((sum, item) => sum + Number(item.subtotal), 0);
                totalBudget = subtotal * (1 + ((budget?.tax || 0) / 100));
            }

            const columns = [
                { title: "Concepto", field: "concept" },
                { title: "Descripción", field: "description" },
                { title: "Cantidad", field: "quantity" },
                //{ title: "Impuestos", field: "tax" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P/U", field: "unit_price", euroSign: "€" },
                { title: "Subtotal", field: "subtotal", euroSign: "€" }
            ];

            const ContentHeaderModal = () =>
                [
                    m(ButtonComponent, { closeModal: true, bclass: "btn-danger", actions: () => new bootstrap.Modal(document.getElementById("ModalDeleteBudget"), { backdrop: true }).show() },
                        [m("i.fa-solid.fa-trash-can", { style: { color: "white" } }), " Eliminar Presupuesto"]
                    ),
                    m(ButtonComponent, { closeModal: true, bclass: "btn-warning", actions: () => m.route.set(`/budget/update/${budget.budget_number}`) },
                        [m("i.fa-solid.fa-pen-to-square"), " Editar Presupuesto "]
                    )]

            let ContentBodyModal = () =>
                budgetDetails?.length === 0 ?
                    m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                        m("span", "No hay detalles disponibles, por favor cree uno. "),
                        // m("div.spinner-border.text-primary", { role: "status" }, [ m("span.visually-hidden", "Cargando...") ])
                    ]) :
                    m("div.table-responsive", { style: { maxHeight: "55vh", overflowY: "auto" } }, [
                        m("table.table.table-striped.table-hover", { style: { width: "100%", borderCollapse: "collapse" }, }, [
                            m("thead.bg-light.sticky-top", [
                                m("tr.text-center",
                                    m("th", { scope: "col" }, "#"),
                                    columns.map((col) => m("th", { scope: "col" }, col.title))
                                ),
                            ]),
                            m("tbody",
                                budgetDetails
                                    ? budgetDetails.map((detail, index) =>
                                        m("tr.text-center", [m("td", (index + 1)), columns.map((col) => m("td", [detail[col.field] || "N/A", col.euroSign && detail[col.field] ? col.euroSign : ""]))]),
                                    )
                                    : m("tr.text-center", m("td[colspan=8]", "No hay detalles disponibles"))),
                            m("tfoot", [
                                m("tr",
                                    m("td[colspan=7]", [
                                        m("p", `Condiciones: ${budget?.conditions}`)
                                    ]),
                                ),
                                m("tr",
                                    m("th[colspan=7]", [
                                        m("p.text-end", `SubTotal ${(+subtotal).toFixed(2)} €`),
                                        m("p.text-end", `IVA ${(+budget?.tax) || 0}%`),
                                        m("p.text-end", `Total ${totalBudget.toFixed(2)} €`)
                                    ]),
                                )
                            ])
                        ]),
                    ])

            const ContentFooterModal = () =>
                m(ButtonComponent, {
                    actions: () => GeneratePDF(budget, budgetDetails),
                    bclass: "btn-outline-danger"
                }, ["Descargar PDF ", m("i.fa-solid.fa-file-pdf", { style: { color: "red" } })])

            return m(ModalComponent, {
                idModal: idModal,
                title: tituloModal,
                addBtnClose: true,
                slots: {
                    header: ContentHeaderModal(),
                    body: ContentBodyModal(),
                    footer: ContentFooterModal(),
                }
            })
        }
    }
}

function BudgetModalConfirmation() {
    return {
        view: function ({ attrs }) {
            const { idModal, tituloModal, mensaje, actions } = attrs

            const ContentBodyModal = () =>
                m("p.text-center", mensaje)
            const ContentFooterModal = () =>
                m("div.col-12.d-flex.justify-content-center", [
                    m("div.col-md-6.d-flex.flex-md-row.justify-content-between", [
                        m(ButtonComponent, {
                            closeModal: true,
                            bclass: "btn btn-danger ",
                        }, ["Cancelar"]),
                        m(ButtonComponent, {
                            closeModal: true,
                            bclass: "btn btn-success ",
                            actions: actions,
                        }, ["aceptar"])
                    ])
                ])
            return m(ModalComponent, {
                idModal: idModal,
                title: tituloModal,
                slots: {
                    body: ContentBodyModal(),
                    footer: ContentFooterModal(),
                }
            })
        }
    }
}

function FormBudgetComponent() {
    const today = new Date().toISOString().split("T")[0];
    // Impuestos
    const taxes = [{ value: 10, content: "10% IVA" }, { value: 21, content: "21% IVA" }, { value: 3, content: "3% IGIC" }, { value: 7, content: "7% IGIC" }, { value: 4, content: "4% IPSI" }, { value: 10, content: "10% IPSI" }]
    // Opciones de estado
    const statusOptions = [{ value: "Aceptado", content: "Aceptado" }, { value: "Pendiente", content: "Pendiente" }, { value: "Rechazado", content: "Rechazado" },];

    const createHeaderDocument = ({
        inputClient = "",
        inputProject = "",
        inputStatus = "",
        inputCreation = today,
        inputExpiration = today,
        inputTax = 0,
        inputConditions = ""
    } = {}) => ({
        inputClient,
        inputProject,
        inputStatus,
        inputCreation,
        inputExpiration,
        inputTax,
        inputConditions
    });

    const createConcept = ({
        budget_concept_id = "",
        concept = "",
        quantity = 0,
        unit_price = 0,
        description = "",
        discount = 0,
        subtotal = 0
    } = {}) => ({
        budget_concept_id,
        concept,
        quantity,
        unit_price,
        description,
        discount,
        subtotal
    });

    const state = {
        clients: [],
        projects: [],
        conceptItems: [createConcept()],
        selectedBudget: null,
        budgetDetails: [],
        filterClients: "",
        filterProjects: "",
        headerDocument: [createHeaderDocument()],
        conceptItemsUpdate: []
    };

    const collectFormData = () => {
        return {
            header: { ...state.headerDocument[0] },
            concepts: [...(state.conceptItemsUpdate.length ? state.conceptItemsUpdate : state.conceptItems)]
        };
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = collectFormData();
        // Validación básica
        if (!dataToSend.header.inputClient || !dataToSend.header.inputProject) {
            Toastify({
                text: "¡Por favor, selecciona cliente y proyecto.!",
                className: "toastify-error",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast();
            return;
        }

        try {
            state.isLoading = true;
            const isUpdate = !!state.selectedBudget;
            const data = isUpdate
                ? await updateBudget(dataToSend, state.selectedBudget.budget_id)
                : await createBudget(dataToSend);
            console.log("Response form: ", data);

            // Resetear solo si se creó nuevo
            if (!isUpdate) { state.headerDocument = [createHeaderDocument()]; state.conceptItems = [createConcept()]; }

            Toastify({
                text: "¡Operación exitosa!",
                className: "toastify-success",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast();

            m.route.set("/budgets")
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            Toastify({
                text: "¡Algo salió mal!",
                className: "toastify-error",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast();
        } finally {
            state.isLoading = false;
        }
    }

    const totalBudget = () => {
        const pBruto = state.conceptItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);
        return pBruto * (1 + state.selectedBudget?.tax / 100);
        //state.conceptItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
    }


    const updateConceptSubtotal = (item) => {
        //const tax = parseFloat(item.tax || 0);
        const quantity = parseFloat(item.quantity || 0);
        const unit_price = parseFloat(item.unit_price || 0);
        const discount = parseFloat(item.discount || 0);

        const pBruto = quantity * unit_price;
        const pNeto = pBruto //* (1 + tax / 100);

        item.subtotal = Math.max(pNeto - discount, 0);
        m.redraw();
    };

    async function loadBudgetFormData(budget_number = null) {
        try {
            // Clientes
            const rawClients = await fetchClients();
            state.clients = rawClients.map(c => ({
                id: c.client_id,
                value: c.client_id,
                label: `${c.name} ${c.surname} - ${c.client_id_document}`
            }));
            console.log("Clientes: ", state.clients);

            // Proyectos
            const rawProjects = await fetchProjects();
            state.projects = rawProjects.map(p => ({
                id: p.project_id,
                value: p.project_id,
                label: `${p.name} - ${p.status}`
            }));
            console.log("Proyectos: ", state.projects);

            // Solo si es modo edición (update)
            if (budget_number) {
                state.selectedBudget = (await fetchBudgets()).find(b => b.budget_number == budget_number);

                state.headerDocument = [
                    createHeaderDocument({
                        inputClient: state.selectedBudget.client_id,
                        inputProject: state.selectedBudget.project_id,
                        inputStatus: state.selectedBudget.status,
                        inputTax: state.selectedBudget.tax,
                        inputCreation: today,
                        inputExpiration: today,
                        inputConditions: state.selectedBudget.conditions
                    })
                ];
                console.log("Encabezado:", state.headerDocument);

                // Conceptos
                state.budgetDetails = await fetchBudgetDetails(state.selectedBudget.budget_id);
                state.conceptItemsUpdate = state.budgetDetails.map((item) =>
                    createConcept({
                        budget_concept_id: item.budget_concept_id,
                        concept: item.concept,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        description: item.description,
                        //tax: item.tax,
                        discount: item.discount,
                        subtotal: item.subtotal
                    })
                );
                console.log("Items actualizables:", state.conceptItemsUpdate);
            }

            m.redraw();
        } catch (error) {
            console.error("Error cargando datos del formulario:", error);
        }
    }


    return {
        oncreate: ({ attrs }) => {
            loadBudgetFormData(attrs.budget_number);
        },
        view: ({ attrs }) => {
            const { typeForm } = attrs;

            const filterList = (list, keyword) =>
                list.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(keyword.toLowerCase())));

            const renderInputGroup = (label, filterKey, icon = "fa-magnifying-glass") =>
                m("div.col-md-4.d-flex.flex-column.align-items-start", [
                    m("label.form-label", label),
                    m("div.input-group.flex-nowrap", [
                        m("input.form-control", { oninput: e => state[filterKey] = e.target.value }),
                        m("span.input-group-text", { onclick: e => e.target.closest(".input-group").querySelector("input").focus() }, m("i.fa", { class: icon }))
                    ])
                ]);

            const renderSelect = (label, options, id, bclass = "col-md-4", typeNumber = false) =>
                m("div", { class: bclass }, [
                    m("label.form-label", label),
                    m("select.form-select", {
                        id: id,
                        value: typeNumber ? Number(state.headerDocument[0]?.[id]) : state.headerDocument[0]?.[id],
                        onchange: e => { state.headerDocument[0][id] = e.target.value; m.redraw(); },
                    },
                        m("option", { value: "", disabled: true, selected: !state.headerDocument[0]?.[id] }, "-- Selecciona --"),
                        ...options.map(opt => m("option", { value: typeNumber ? Number(opt.value) : opt.value }, opt.label || opt.content))
                    )
                ]);

            const renderInputDate = (label, type, id) =>
                m("div.col-md-2", [
                    m("label.form-label", label),
                    m("input.form-control", {
                        type: "date",
                        id: id,
                        value: state.headerDocument[0]?.[id] || today,
                        oninput: e => {
                            state.headerDocument[0][id] = e.target.value;
                            m.redraw();
                        },
                        min: type == 1 ? "" : today,
                        max: type == 1 ? today : "",
                    })
                ])

            // Grupo de conceptos
            const renderConcept = (item, index) =>
                m("div.row.col-12.mt-3.p-0.m-0", [
                    m("input", { id: `id-${index}`, type: "hidden", value: item.concept, }),
                    // Concepto
                    m("div.col-md-6", [
                        m("label.form-label", `Concepto* #${index + 1}`),
                        m("input.form-control", {
                            id: `concept-${index}`,
                            value: item.concept,
                            oninput: e => item.concept = e.target.value
                        })
                    ]),
                    // Cantidad
                    m("div.col-md-2", [
                        m("label.form-label", "Cantidad *"),
                        m("input.form-control", {
                            type: "number",
                            placeholder: "0",
                            min: 0,
                            id: `quantity-${index}`,
                            value: item.quantity,
                            oninput: e => { item.quantity = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Descuentos
                    m("div.col-md-2", [
                        m("label.form-label", "Descuento"),
                        m("input.form-control", {
                            type: "number",
                            step: "any",
                            min: 0,
                            placeholder: "0 €",
                            id: `discount-${index}`,
                            value: item.discount,
                            oninput: e => { item.discount = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Precio unitario
                    m("div.col-md-2", [
                        m("label.form-label", " P / U *"),
                        m("input.form-control", {
                            type: "number",
                            step: "any",
                            placeholder: "0",
                            min: 0,
                            id: `price-${index}`,
                            value: item.unit_price,
                            oninput: e => { item.unit_price = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Descripción
                    m("div.col-md-6.mt-2", [
                        m("label.form-label", "Descripción"),
                        m("textarea.form-control", {
                            id: `description-${index}`,
                            style: {
                                height: "38px",
                            },
                            placeholder: "Opcional...",
                            value: item.description,
                            oninput: e => { item.description = e.target.value; updateConceptSubtotal(item) }
                        })
                    ]),
                    m("div.col-md-4"),

                    // Suub Total
                    m("div.col-md-2.mt-2", [
                        m("label.form-label", "SubTotal"),
                        m("input.form-control[readonly]", { id: `subtotal-${index}`, value: `${Number(item.subtotal ?? 0).toFixed(2)} €` })
                    ])
                ])

            // Btns Eliminar y Añadir concepto
            const btnsAction = () =>
                m("div.col-12.mt-3.d-flex.justify-content-center", [
                    m("div.col-md-8.d-flex.flex-column.flex-md-row.justify-content-between.gap-4", [
                        m(ButtonComponent, {
                            bclass: "btn btn-danger ",
                            actions: () => typeForm == "update" ? state.conceptItemsUpdate.pop() : state.conceptItems.pop(),
                        },
                            ["Eliminar concepto", m("i.fa.fa-trash-can.me-2.ms-2", { style: { color: "white" } })]),
                        m(ButtonComponent, {
                            bclass: "btn-warning ",
                            actions: () => typeForm == "update" ? state.conceptItemsUpdate.push(createConcept()) : state.conceptItems.push(createConcept()),
                        }, ["Añadir concepto", m("i.fa.fa-plus.me-2.ms-2")]),
                        m(ButtonComponent, {
                            bclass: "btn-outline-danger",
                            actions: () => generatePDF(DATA[0])
                        }, ["Descargar PDF ", m("i.fa-solid.fa-file-pdf", { style: { color: "red" } })]
                        )
                    ])
                ])

            // Btns volver y aceptar
            const btnsFoot = () =>
                m("div.col-12.d-flex.justify-content-center.mt-5", [
                    m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                        m(ButtonComponent, {
                            bclass: "btn-warning ",
                            actions: () => new bootstrap.Modal(document.getElementById("ModalCancelationBudget")).show()
                            ,
                        }, ["Volver", m("i.fa.fa-arrow-left.me-2.ms-2")]),
                        m(ButtonComponent, {
                            type: "submit",
                            class: "btn-success ",
                        }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                    ])
                ])

            //Formulario completo y renderizado
            return m("div.col-11.col-md-10", { style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", overflow: "hidden" } }, [
                m("form.row.col-12", { onsubmit: handleFormSubmit }, [
                    m("hr"),
                    m("span.fw-bold.text-uppercase.fs-5", "Cabecera del documento"),
                    m("div.row.col-12.p-0.m-0", [
                        renderInputGroup("Filtrar clientes", "filterClients"),
                        renderInputGroup("Filtrar proyectos", "filterProjects"),
                        renderSelect("Estado", statusOptions, "inputStatus", "col-md-2"),
                        renderSelect("IVA", taxes, "inputTax", "col-md-2", true),
                        renderSelect("Cliente", filterList(state.clients, state.filterClients), "inputClient",),
                        renderSelect("Proyecto", filterList(state.projects, state.filterProjects), "inputProject",),
                        renderInputDate("Creación*", 1, "inputCreation",),
                        renderInputDate("Expiración*", 2, "inputExpiration",),
                        m("hr.mt-4")
                    ]),

                    m("h5", "Conceptos"),
                    // Conceptos dinámicos
                    typeForm == "update" ? state.conceptItemsUpdate.map(renderConcept) : state.conceptItems.map(renderConcept),
                    // Botones añadir/eliminar concepto
                    btnsAction(),
                    // Total
                    m("hr.mt-4"),
                    m("div.col-12.text-end", [m("h5", `Total presupuesto: ${totalBudget()} €`)]),
                    m("hr.mt-4"),
                    m("div.col-md-12", [
                        m("label.form-label", 'Condiciones del presupuesto'),
                        m("input.form-control", {
                            id: 'inputConditions',
                            value: state.headerDocument[0]?.inputConditions,
                            oninput: e => {
                                state.headerDocument[0].inputConditions = e.target.value;
                                m.redraw();
                            },
                        })
                    ]),
                    btnsFoot()
                ])
            ])
        }
    }
}

function GeneratePDF(budget, budgetDetails) {
    const PresupuestoView = {
        view: () =>
            m("div.container.col-10.d-none", [
                m("button.btn.btn-primary.p-3", { onclick: GeneratePDF }, "Descargar PDF"),
                m("div#pdf-content.bg-white.px-4.rounded.shadow", [

                    // Encabezado
                    m("div.row", [
                        m("div.col-md-12.d-flex.justify-content-between.align-items-center", [
                            m("div.text-center", [
                                m("img", {
                                    src: "./assets/logosObraSmart/logo-1.png",
                                    alt: "Logo",
                                    style: "width: 100px; height: 100px;"
                                }),
                                m("p.mb-0#company-name"),
                            ]),
                            m("h1", "Presupuesto"),
                            m("div.text-end", [
                                m("p.mb-0#company-nif"),
                                m("p.mb-0#company-phone"),
                                m("p.mb-0#company-email"),
                                m("p.mb-0#company-address"),
                            ]),
                        ]),
                    ]),

                    // Datos cliente/presupuesto
                    m("div.row.pt-5", [
                        m("div.card.col-md-12", [
                            m("div.card-header.bg-light.d-flex.justify-content-between", m("strong", "Datos del presupuesto"), m("strong", "Datos del cliente")),
                            m("div.card-body.d-flex.justify-content-between.py-1", [
                                m("div.text-start", [
                                    m("p.mb-0", ["Nº: ", m("span#budget-number")]),
                                    m("p.mb-0", ["Fecha emisión: ", m("span#budget-issue")]),
                                    m("p", ["Válido hasta: ", m("span#budget-due")])
                                ]),
                                m("div.text-end", [
                                    m("p.mb-0#client-name"),
                                    m("p.mb-0#client-id"),
                                    m("p.mb-0#client-address"),
                                    m("p.mb-0#client-phone"),
                                    m("p.mb-0#client-email"),
                                ]),
                            ])
                        ]),
                    ]),

                    // Tabla conceptos (primera parte)
                    m("div.row.mt-5", [
                        m("div.card.col-md-12", [
                            m("div.card-body.p-0", [
                                m("table.table.table-striped.m-0", [
                                    m("thead.table-light", [
                                        m("tr", [
                                            m("th", "#"),
                                            m("th", "Concepto"),
                                            m("th", "Descripción"),
                                            m("th", "Cantidad"),
                                            m("th", "P / U"),
                                            m("th", "Subtotal")
                                        ])
                                    ]),
                                    m("tbody#concepts-table")
                                ]),
                            ]),
                        ]),
                    ]),

                    // Segunda tabla generada dinámicamente
                    m("div#extra-page-container"),

                    // Totales
                    m("div.row", [
                        m("div.card", [
                            m("div.text-end", [
                                m("p.mb-0", ["SubTotal: ", m("span#budget-subtotal")]),
                                m("p.mb-0", ["IVA: ", m("span#budget-iva")]),
                                m("h5#totals-summary.fw-bold")
                            ])
                        ])
                    ]),

                    // Condiciones
                    m("div.row.mt-5", [
                        m("div.card", [
                            m("div.card-header.bg-light", m("strong", "Condiciones")),
                            m("div.card-body", m("p.mb-0#conditions"))
                        ]),
                    ]),

                    // Firmas
                    m("div.col-12.mt-5.pt-5.d-flex.justify-content-around.text-center", [
                        m("div.col-4",
                            m("hr"),
                            m("p", "Firma empresa"),
                        ),
                        m("div.col-4",
                            m("hr"),
                            m("p", "Firma cliente"),
                        )
                    ])
                ])
            ])
    };

    const DATA = {
        company: {
            title: "ObraSmart S.L.",
            nif: "B12345678",
            address: "Calle Empresa 123, Ciudad",
            phone_number: "912345678",
            email: "info@obrasmart.es"
        },
        budget: {
            budget_number: budget.budget_number,
            issue_date: budget.date,
            due_date: budget.due_date || "No especificada"
        },
        client: {
            name: budget.client_name,
            client_id_document: budget.client_id_document || "N/A",
            phone: budget.client_phone || "N/A",
            email: budget.client_email || "N/A",
            address: budget.client_address || "N/A"
        },
        subtotal: budget.subtotal || "N/A",
        iva: budget.iva || "N/A",
        concepts: budgetDetails || [],
        conditions: budget.conditions || "Condiciones no especificadas."
    };

    function populateData(DATA) {
        const { company, budget, client, concepts } = DATA;

        // Empresa
        document.getElementById("company-name").textContent = company.title;
        document.getElementById("company-nif").textContent = `NIF: ${company.nif}`;
        document.getElementById("company-address").textContent = `${company.address}`;
        document.getElementById("company-phone").textContent = `${company.phone_number}`;
        document.getElementById("company-email").textContent = `${company.email}`;

        // Presupuesto
        document.getElementById("budget-number").textContent = budget.budget_number;
        document.getElementById("budget-issue").textContent = budget.issue_date;
        document.getElementById("budget-due").textContent = budget.due_date;

        // Cliente
        document.getElementById("client-name").textContent = `${client.name}`;
        document.getElementById("client-id").textContent = `NIF: ${client.client_id_document}`;
        document.getElementById("client-phone").textContent = `${client.phone}`;
        document.getElementById("client-email").textContent = `${client.email}`;
        document.getElementById("client-address").textContent = `${client.address}`;

        // Conceptos
        const tbody = document.getElementById("concepts-table");
        tbody.innerHTML = "";
        let total = 0;

        const chunkLimit = 12;
        const firstChunk = concepts.slice(0, chunkLimit);
        const secondChunk = concepts.slice(chunkLimit);

        firstChunk.forEach((item, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
          <td>${i + 1}</td>
          <td>${item.concept}</td>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
           <td>${item.unit_price} €</td>
          <td>${Number(item.subtotal ?? 0).toFixed(2)} €</td>`;
            total += item.subtotal;
            tbody.appendChild(tr);
        });

        if (secondChunk.length > 0) {
            const extraContainer = document.getElementById("extra-page-container");
            extraContainer.innerHTML = `
          <div class="page-break"></div>
          <div class="row mb-4">
            <div class="col-md-12 d-flex justify-content-between align-items-center">
              <div class="text-center">
                <img src="../assets/logosObraSmart/logo-1.png" alt="Logo" style="width: 100px; height: 100px;">
                <p class="mb-0">${company.title}</p>
              </div>
              <h1>Presupuesto</h1>
              <div class="text-end">
                <p class="mb-0">NIF: ${company.nif}</p>
                <p class="mb-0">${company.phone_number}</p>
                <p class="mb-0">${company.email}</p>
                <p class="mb-0">${company.address}</p>
              </div>
            </div>
          </div>
          <div class="row mt-5">
            <div class="card col-md-12">
              <div class="card-body p-0">
                <table class="table table-striped m-0">
                  <thead class="table-light">
                    <tr>
                      <th>#</th>
                      <th>Concepto</th>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                       <th>Precio/U</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody id="second-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        `;

            const secondTbody = document.getElementById("second-table-body");
            secondChunk.forEach((item, i) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
            <td>${i + chunkLimit + 1}</td>
            <td>${item.concept}</td>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
             <td>${item.unit_price} €</td>
            <td>${item.subtotal.toFixed(2)} €</td>`;
                secondTbody.appendChild(tr);
            });
        }
        document.getElementById("budget-subtotal").textContent = budget.subtotal;

        document.getElementById("budget-iva").textContent = budget.iva;

        document.getElementById("totals-summary").innerHTML = `Total Presupuesto: ${Number(budget.total ?? 0).toFixed(2)} €`;

        document.getElementById("conditions").textContent = budget.conditions;
    }

    const container = document.createElement("div");
    container.style.display = "none";
    document.body.appendChild(container);
    m.mount(container, PresupuestoView);
    populateData(DATA)

    setTimeout(() => {
        const element = container.querySelector("#pdf-content");
        html2pdf().set({
            margin: 7.5,
            filename: `presupuesto-${budget.budget_number}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save().then(() => {
            m.mount(container, null); // Desmontar Mithril
            document.body.removeChild(container); // Limpiar
        });
    }, 100);
}

export { BudgetsPage }