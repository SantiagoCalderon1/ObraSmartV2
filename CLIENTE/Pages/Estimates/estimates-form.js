import { ButtonComponent } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchEstimates, fetchBudgetDetails, fetchClients, fetchProjects, createBudget, updateBudget } from "../../Services/estimates-service.js";


export function BudgetFormPage() {
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
                state.selectedBudget = (await fetchEstimates()).find(b => b.budget_number == budget_number);

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