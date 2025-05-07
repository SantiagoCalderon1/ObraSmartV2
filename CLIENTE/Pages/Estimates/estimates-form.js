import { ButtonComponent, ModalConfirmation } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchEstimates, fetchEstimate, fetchClients, fetchProjects, createBudget, updateBudget } from "../../Services/services.js";


export function EstimateFormPage() {
    return {
        view: function ({ attrs }) {
            const { type, estimate_number } = attrs
            const isUpdate = type === "update";
            const title = isUpdate ? `Actualizando el Presupuesto #${estimate_number}` : "Creando Nuevo Presupuesto";

            return [
                m("h1.text-center.fw-semibold.text-uppercase", { style: { padding: "2rem 1rem", textTransform: "uppercase" } }, title),
                m(EstimateFormComponent, {
                    type: type,
                    estimate_number: estimate_number // puede ser `undefined` en creación
                }),
                m(ModalConfirmation, {
                    idModal: "ModalCancelation",
                    tituloModal: "Confirmación de cancelación",
                    mensaje: isUpdate
                        ? "¿Está seguro de cancelar la actualización del presupuesto?"
                        : "¿Está seguro de cancelar la creación del nuevo presupuesto?",
                    actions: () => {
                        m.route.set("/estimates");
                        m.redraw();
                    }
                })
            ];
        }
    }
}




function EstimateFormComponent() {
    let style = {
        _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
        _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
    }
 
    // Fecha Actual
    const today = new Date().toISOString().split("T")[0];
    // Impuestos
    const taxes = [{ value: 10, content: "10% IVA" }, { value: 21, content: "21% IVA" }, { value: 3, content: "3% IGIC" }, { value: 7, content: "7% IGIC" }, { value: 4, content: "4% IPSI" }, { value: 10, content: "10% IPSI" }]
    // Opciones de estado
    const status = [{ value: "Aceptado", content: "Aceptado" }, { value: "Pendiente", content: "Pendiente" }, { value: "Rechazado", content: "Rechazado" },];

    const EstimateData = ({
        estimate_number = "",
        project_id = "",
        client_id = "",
        status = "",
        issue_date = today,
        due_date = today,
        iva = 0,
        total_cost = 0,
        conditions = ""
    } = {}) => ({
        estimate_number,
        project_id,
        client_id,
        status,
        issue_date,
        due_date,
        iva,
        total_cost,
        conditions
    });

    const estimateMaterialData = ({
        material_id = "",
        quantity = 0,
        unit_price = 0,
        discount = 0,
        total_price = 0
    } = {}) => ({
        material_id,
        quantity,
        unit_price,
        discount,
        total_price,
    });

    const estimateLaborsData = ({
        labor_type_id = "",
        hours = 0,
        cost_per_hour = 0,
        discount = 0,
        total_cost = 0
    } = {}) => ({
        labor_type_id,
        hours,
        cost_per_hour,
        discount,
        total_cost,
    });


    const state = {
        estimateData: EstimateData(),
        estimateMaterialData: [estimateMaterialData()],
        estimateLaborsData: [estimateLaborsData()],
        clients: [],
        projects: [],
        selectedEstimate: null,
        filterClients: "",
        filterProjects: "",
        estimateMaterialDataUpdate: [],
        estimateLaborsDataDataUpdate: []
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
            if (!isUpdate) { state.headerDocument = [EstimateData()]; state.conceptItems = [createConcept()]; }

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

    async function loadEstimate(estimate_id = null) {
        try {
            // Clientes
            state.clients = (await fetchClients()).data
            state.projects = (await fetchProjects()).data

            console.log("Clientes: ", state.clients);
            console.log("Proyectos: ", state.projects);


            // Solo si es modo edición (update)
            if (estimate_id) {
                state.selectedEstimate = await fetchEstimate(estimate_id);
                console.log("selectedEstimate:", state.selectedEstimate);
                // Estimate
                state.estimateData = [
                    EstimateData({
                        estimate_number: state.selectedEstimate.estimate_number,
                        project_id: state.selectedEstimate.project_id,
                        client_id: state.selectedEstimate.client_id,
                        status: state.selectedEstimate.status,
                        issue_date: today,
                        due_date: today,
                        iva: state.selectedEstimate.tax,
                        conditions: state.selectedEstimate.conditions
                    })
                ]
                console.log("EstimateData:", state.estimateData);
                // materials
                state.estimateMaterialDataUpdate = state.estimateData?.materials.map((item) =>
                    estimateMaterialData({
                        material_id: item.estimate_material_id,
                        concept: item.concept,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        discount: item.discount,
                        total_price: item.total_price
                    })
                )
                console.log("Items materials actualizables:", state.estimateMaterialDataUpdate);
                //labors
                state.estimateLaborsDataDataUpdate = state.estimateData?.labors.map((item) =>
                    estimateMaterialData({
                        labor_type_id: item.labor_type_id,
                        hours: item.hours,
                        cost_per_hour: item.cost_per_hour,
                        discount: item.discount,
                        total_cost: item.total_cost,
                    })
                )
                console.log("Items labors actualizables:", state.estimateLaborsDataDataUpdate);
            }
            m.redraw();
        } catch (error) {
            console.error("Error cargando datos del formulario:", error);
        }
    }

    return {
        oncreate: ({ attrs }) => {
            loadEstimate(attrs.estimate_id);
        },
        view: ({ attrs }) => {
            const { type } = attrs;

            const filterList = (list, keyword) =>
                list.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(keyword.toLowerCase())));

            // Btns Eliminar y Añadir concepto
            const btnsAction = ({ keyPop, keyPush, createConcept }) => {
                const isEmpty = state[keyPop].length === 0;
                return m("div.col-12.mt-3.d-flex.justify-content-center", [
                    m("div.col-md-8.d-flex.flex-column.flex-md-row.justify-content-between.gap-4", [
                        // Botón Eliminar
                        m(ButtonComponent, {
                            bclass: "btn btn-danger",
                            disabled: isEmpty,
                            actions: () => state[keyPop].pop(),
                        }, [
                            "Eliminar concepto",
                            m("i.fa.fa-trash-can.me-2.ms-2", { style: { color: "white" } })
                        ]),
                        // Botón Añadir
                        m(ButtonComponent, {
                            bclass: "btn-warning",
                            actions: () => state[keyPush].push(createConcept()),
                        }, [
                            "Añadir concepto",
                            m("i.fa.fa-plus.me-2.ms-2")
                        ])
                    ])
                ]);
            };

            const renderEstimate = () =>
                m("div", { class: "row col-12 p-0 m-0" }, [
                    m("hr"),
                    //Titulo
                    m("span", { class: "fw-semibold text-uppercase fs-5 py-3" }, "Cabecera del documento"),
                    // Cliente filter
                    m("div", { class: "col-md-4 d-flex flex-column align-items-start py-2" }, [
                        m("div.input-group.flex-nowrap", [
                            m("input.form-control", {
                                style: { ...style._input_main },
                                value: state.filterClients || "",
                                placeholder: " Filtrar cliente",
                                oninput: e => {
                                    state.filterClients = e.target.value;
                                    m.redraw();
                                }
                            }),
                            m("span.input-group-text", {
                                style: { ...style._input_main },
                                onclick: e => e.target.closest(".input-group").querySelector("input").focus()
                            }, m("i.fa", { class: "fa-magnifying-glass" }))
                        ])
                    ]),
                    // Cliente input
                    m("div.col-md-4.py-1", [
                        m("label.form-label.ps-1", "Cliente"),
                        m("select.form-select", {
                            style: { ...style._input_secondary },
                            id: "client_id",
                            value: state.estimateData?.client_id,
                            onchange: e => {
                                state.estimateData.client_id = e.target.value;
                                m.redraw();
                            }
                        }, [
                            m("option", { value: "", disabled: true, selected: !state.estimateData?.client_id }, "-- Selecciona Cliente --"),
                            ...(Array.isArray(state.clients) ? filterList(state.clients, state.filterClients) : []).map(opt =>
                                m("option", { value: opt.client_id }, opt.name || opt.content)
                            )
                        ])
                    ]),
                    m("div.col-md-4.py-2",),

                    // Proyecto filter
                    m("div", { class: "col-md-4 d-flex flex-column align-items-start py-3" }, [
                        m("div.input-group.flex-nowrap", [
                            m("input.form-control", {
                                style: { ...style._input_main },
                                placeholder: " Filtrar proyecto",
                                value: state.filterProjects || "",
                                oninput: e => {
                                    state.filterProjects = e.target.value;
                                    m.redraw();
                                }
                            }),
                            m("span.input-group-text", {
                                style: { ...style._input_main },
                                onclick: e => e.target.closest(".input-group").querySelector("input").focus()
                            }, m("i.fa", { class: "fa-magnifying-glass" }))
                        ])
                    ]),
                    //projecto input
                    m("div.col-md-4.py-1", [
                        m("label.form-label.ps-1", "Proyecto"),
                        m("select.form-select", {
                            style: { ...style._input_secondary },
                            id: "project_id",
                            value: state.estimateData?.project_id,
                            onchange: e => {
                                state.estimateData.project_id = e.target.value;
                                m.redraw();
                            }
                        }, [
                            m("option", { value: "", disabled: true, selected: !state.estimateData?.project_id }, "-- Selecciona Proyecto --"),
                            ...(Array.isArray(state.projects) ? filterList(state.projects, state.filterProjects) : []).map(opt =>
                                m("option", { value: opt.project_id }, opt.name || opt.content)
                            )
                        ])
                    ]),
                    m("div.col-md-4.py-2",),

                    // Estado
                    m("div.col-md-2.py-2", [
                        m("label.form-label.ps-1", "Estado"),
                        m("select.form-select", {
                            style: { ...style._input_secondary },
                            id: "status",
                            value: state.estimateData?.status,
                            onchange: e => { state.estimateData.status = e.target.value; m.redraw(); }
                        }, [
                            m("option", { value: "", disabled: true, selected: !state.estimateData?.status }, "-- Selecciona Estado--"),
                            ...status.map(opt =>
                                m("option", { value: opt.value }, opt.label || opt.content)
                            )
                        ])
                    ]),

                    // IVA
                    m("div.col-md-2.py-2", [
                        m("label.form-label.ps-1", "IVA"),
                        m("select.form-select", {
                            style: { ...style._input_secondary },
                            id: "iva",
                            value: Number(state.estimateData?.iva) || 21,
                            onchange: e => { state.estimateData.iva = Number(e.target.value); m.redraw(); }
                        }, [
                            m("option", { value: "", disabled: true, selected: !state.estimateData?.iva }, "-- Selecciona --"),
                            ...taxes.map(opt =>
                                m("option", { value: Number(opt.value) }, opt.content)
                            )
                        ])
                    ]),

                    // Fecha de creación
                    m("div.col-md-2.py-2", [
                        m("label.form-label.ps-1", "Creación*"),
                        m("input.form-control", {
                            style: { ...style._input_secondary },
                            type: "date",
                            id: "issue_date",
                            value: state.estimateData?.issue_date || today,
                            max: today,
                            oninput: e => { state.estimateData.issue_date = e.target.value; m.redraw(); }
                        })
                    ]),

                    // Fecha de expiración
                    m("div.col-md-2.py-2", [
                        m("label.form-label.ps-1", "Expiración*"),
                        m("input.form-control", {
                            style: { ...style._input_secondary },
                            type: "date",
                            id: "due_date",
                            value: state.estimateData?.due_date || today,
                            min: today,
                            oninput: e => { state.estimateData.due_date = e.target.value; m.redraw(); }
                        })
                    ]),
                    m("hr.mt-4")
                ])

            // Grupo de conceptos
            const renderEstimateMaterialData = (item, index) =>
                m("div.row.col-12.mt-3.p-0.m-0", [
                    m("input", { id: `material_id`, type: "hidden", value: item.material_id, }),
                    //  Nombre 
                    m("div.col-md-6", [
                        m("label.form-label", `Material* #${index + 1}`),
                        m("input.form-control", {
                            id: "material",
                            value: item.material?.name,
                            oninput: e => item.material.name = e.target.value
                        })
                    ]),
                    // Cantidad
                    m("div.col-md-2", [
                        m("label.form-label", "Cantidad *"),
                        m("input.form-control", {
                            id: "quantity",
                            type: "number",
                            min: 0,
                            placeholder: `${item.quantity} ${item.material?.unit} `,
                            value: item.quantity,
                            oninput: e => { item.quantity = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Precio unitario
                    m("div.col-md-2", [
                        m("label.form-label", " P / U *"),
                        m("input.form-control", {
                            id: "unit_price",
                            type: "number",
                            min: 0,
                            step: "any",
                            placeholder: "0",
                            value: item.unit_price,
                            oninput: e => { item.unit_price = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Descuentos
                    m("div.col-md-2", [
                        m("label.form-label", "Descuento"),
                        m("input.form-control", {
                            id: "discount",
                            type: "number",
                            step: "any",
                            min: 0,
                            placeholder: "0 €",
                            value: item.discount,
                            oninput: e => { item.discount = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    m("div.col-md-4"),
                    // Suub Total
                    m("div.col-md-2.mt-2", [
                        m("label.form-label", "SubTotal"),
                        m("input.form-control[readonly]", { id: "subtotal", value: `${Number(item.total_price ?? 0).toFixed(2)} €` })
                    ]),
                ])

            const renderEstimateLaborsData = (item, index) =>
                m("div.row.col-12.mt-3.p-0.m-0", [
                    m("input", { id: `material_id`, type: "hidden", value: item.labor_type_id, }),
                    //  Nombre 
                    m("div.col-md-6", [
                        m("label.form-label", `Servicio* #${index + 1}`),
                        m("input.form-control", {
                            id: "material",
                            value: item.labor_type?.name,
                            oninput: e => item.labor_type.name = e.target.value
                        })
                    ]),
                    // Cantidad
                    m("div.col-md-2", [
                        m("label.form-label", "Horas *"),
                        m("input.form-control", {
                            id: "hours",
                            type: "number",
                            min: 0,
                            placeholder: `${item.hours} h`,
                            value: item.hours,
                            oninput: e => { item.hours = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Precio unitario
                    m("div.col-md-2", [
                        m("label.form-label", " P / U *"),
                        m("input.form-control", {
                            id: "cost_per_hour",
                            type: "number",
                            min: 0,
                            step: "any",
                            placeholder: "0",
                            value: item.cost_per_hour,
                            oninput: e => { item.cost_per_hour = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    // Descuentos
                    m("div.col-md-2", [
                        m("label.form-label", "Descuento"),
                        m("input.form-control", {
                            id: "discount",
                            type: "number",
                            step: "any",
                            min: 0,
                            placeholder: "0 €",
                            value: item.discount,
                            oninput: e => { item.discount = +e.target.value; updateConceptSubtotal(item); }
                        })
                    ]),
                    m("div.col-md-4"),
                    // Suub Total
                    m("div.col-md-2.mt-2", [
                        m("label.form-label", "SubTotal"),
                        m("input.form-control[readonly]", { id: "subtotal", value: `${Number(item.total_cost ?? 0).toFixed(2)} €` })
                    ]),

                ])

            // Btns volver y aceptar
            const renderButtonsFoot = () =>
                m("div.col-12.d-flex.justify-content-center.mt-5", [
                    m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                        m(ButtonComponent, {
                            bclass: "btn-warning ",
                            actions: () => new bootstrap.Modal(document.getElementById("ModalCancelation")).show()
                            ,
                        }, ["Volver", m("i.fa.fa-arrow-left.me-2.ms-2")]),
                        m(ButtonComponent, {
                            type: "submit",
                            class: "btn-success ",
                        }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                    ])
                ])

            //Formulario completo y renderizado
            return m("div",
                {
                    class: "col-11 col-md-10 d-flex flex-column justify-content-center align-items-center p-3 overflow-hidden",
                    style: { backgroundColor: "var(--mainWhite)", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }
                }, [
                m("form", {
                    class: "row col-12",
                    onsubmit: handleFormSubmit
                }, [


                    renderEstimate(),

                    m("h5", "Conceptos"),
                    // Conceptos dinámicos

                    type == "update" ?
                        state.estimateMaterialDataUpdate.map(renderEstimateMaterialData)
                        :
                        state.estimateMaterialData.map(renderEstimateMaterialData),
                    type == "update" ?
                        btnsAction({ keyPop: "estimateMaterialDataUpdate", keyPush: "estimateMaterialDataUpdate", createConcept: estimateMaterialData })
                        :
                        btnsAction({ keyPop: "estimateMaterialData", keyPush: "estimateMaterialData", createConcept: estimateMaterialData }),
                    type == "update" ?
                        state.estimateLaborsDataDataUpdate.map(renderEstimateLaborsData)
                        :
                        state.estimateLaborsData.map(renderEstimateLaborsData),
                    type == "update" ?
                        btnsAction({ keyPop: "estimateLaborsDataUpdate", keyPush: "estimateLaborsDataUpdate", createConcept: estimateLaborsData })
                        :
                        btnsAction({ keyPop: "estimateLaborsData", keyPush: "estimateLaborsData", createConcept: estimateLaborsData }),
                    // Botones añadir/eliminar concepto

                    // Total
                    m("hr.mt-4"),
                    //m("div.col-12.text-end", [m("h5", `Total presupuesto: ${totalBudget()} €`)]),
                    m("hr.mt-4"),
                    m("div.col-md-12", [
                        m("label.form-label", 'Condiciones del presupuesto'),
                        m("input.form-control", {
                            id: 'inputConditions',
                            value: state.estimateData[0]?.conditions,
                            oninput: e => {
                                state.estimateData[0].conditions = e.target.value;
                                m.redraw();
                            },
                        })
                    ]),
                    renderButtonsFoot()
                ])
            ])
        }
    }
}













/* // Descripción
m("div.col-md-6.mt-2", [
    m("label.form-label", "Descripción"),
    m("input.form-control", {
        id: "total_price",
        type: "number",
        step: "any",
        min: 0,
        placeholder: "0 €",
        value: item.total_price,
        oninput: e => { item.total_price = e.target.value; updateConceptSubtotal(item) }
    })
]),


    m(ButtonComponent, {
        bclass: "btn-outline-danger",
        actions: () => generatePDF(DATA[0])
    }, ["Descargar PDF ", m("i.fa-solid.fa-file-pdf", { style: { color: "red" } })]
    )
 */




















/* 

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
} */