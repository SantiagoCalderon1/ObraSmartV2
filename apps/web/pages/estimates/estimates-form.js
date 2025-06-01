import Choices from 'choices.js'

import { ModalConfirmation } from "../../components/modal.js"
import { Button } from "../../components/button.js"

// IMPORTADOR DE FUNCIONES
import {
    fetchEstimate,
    createEstimate,
    updateEstimate,
    fetchClients,
    fetchProjects,
    fetchMaterials,
    fetchLaborTypes,
} from "../../Services/services.js"

export function EstimateFormPage() {
    return {
        view: function ({ attrs }) {
            const { type, estimate_number } = attrs
            const isUpdate = type === "update"
            const title = isUpdate ? `Actualizando el Presupuesto #${estimate_number}` : "Creando Nuevo Presupuesto"
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
                        m.route.set("/estimates")
                        m.redraw()
                    }
                })
            ]
        }
    }
}

function EstimateFormComponent() {
    let style = {
        _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
        _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
    }
    // Fecha Actual
    const today = new Date().toISOString().split("T")[0]
    // Impuestos
    const taxes = [{ value: 10, content: "10% IVA" }, { value: 21, content: "21% IVA" }, { value: 3, content: "3% IGIC" }, { value: 7, content: "7% IGIC" }, { value: 4, content: "4% IPSI" }, { value: 10, content: "10% IPSI" }]
    // Opciones de estado
    const status = [{ value: "Aceptado" }, { value: "Pendiente" }, { value: "Rechazado" },]
    // testigo para el formulario 
    let badForm = false

    const EstimateData = ({
        estimate_number = "",
        project_id = 0,
        client_id = 0,
        status = "Pendiente",
        issue_date = today,
        due_date = today,
        iva = 21,
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
    })

    const estimateMaterialData = ({
        material_id = "",
        quantity = 0,
        unit_price = 0,
        discount = 0,
        total_price = 0,
        unit = "N/A"
    } = {}) => ({
        material_id,
        quantity,
        unit_price,
        discount,
        total_price,
        unit
    })

    const estimateLaborsData = ({
        labor_type_id = "",
        hours = 0,
        cost_per_hour = 0,
        discount = 0,
        total_cost = 0,
        description = "",
    } = {}) => ({
        labor_type_id,
        hours,
        cost_per_hour,
        discount,
        total_cost,
        description
    })


    const state = {
        estimateData: EstimateData(),
        estimateMaterialData: [estimateMaterialData()],
        estimateLaborsData: [estimateLaborsData()],
        clients: [],
        projects: [],
        materials: [],
        laborTypes: [],
        selectedEstimate: null,
        filterClients: "",
        filterProjects: "",
        filterMaterials: "",
        filterLaborsType: "",
        isLoading: false,
    }

    const collectFormData = () => {
        return {
            estimate: { ...state.estimateData },
            materials: [...state.estimateMaterialData],
            labors: [...state.estimateLaborsData],
        }
    }

    const handleFormSubmit = async (e, type) => {
        const isUpdate = type === "update"
        e.preventDefault()
        const dataToSend = collectFormData()
        //console.log(dataToSend);


        try {
            state.isLoading = true

            const { client_id, project_id } = state.estimateData;

            const tieneCliente = !!client_id;
            const tieneProjecto = !!project_id;

            const tieneMaterials = Array.isArray(state.estimateMaterialData) &&
                state.estimateMaterialData.some(m => !!m.material_id);

            const tieneServicios = Array.isArray(state.estimateLaborsData) &&
                state.estimateLaborsData.some(l => !!l.labor_type_id);

            if (!tieneCliente || !tieneProjecto) {
                Toastify({
                    text: "Debes seleccionar un cliente y un proyecto.",
                    className: "toastify-error",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right"
                }).showToast();
                return;
            }

            if (!tieneMaterials && !tieneServicios) {
                Toastify({
                    text: "Debes agregar al menos un material o un servicio.",
                    className: "toastify-error",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right"
                }).showToast();
                return;
            }
            const data = isUpdate
                ? await updateEstimate(dataToSend, state.selectedEstimate.estimate_number)
                : await createEstimate(dataToSend)

            //console.log(data);
            
            // Resetear solo si se creó nuevo
            if (!isUpdate) {
                state.estimateData = EstimateData()
                state.estimateMaterialData = [estimateMaterialData()]
                state.estimateLaborsData = [estimateLaborsData()]
            }
            if (data) {
                Toastify({
                    text: "¡Operación exitosa!",
                    className: "toastify-success",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right"
                }).showToast()
                m.route.set("/estimates")
            }
        } catch (error) {
            //console.error(error)
            Toastify({
                text: "¡Algo salió mal!",
                className: "toastify-error",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast()
        } finally {
            state.isLoading = false
            m.redraw()
        }
    }


    function updateConceptSubtotal(item) {
        const price = Number(item.unit_price ?? item.cost_per_hour) || 0
        const qty = Number(item.quantity ?? item.hours) || 0
        const discount = Number(item.discount) || 0
        // Calcular el subtotal
        const subtotal = (price * qty) - discount
        // Asigna al campo correcto
        if ('unit_price' in item || 'quantity' in item) {
            item.total_price = Math.max(0, subtotal)
        } else if ('cost_per_hour' in item || 'hours' in item) {
            item.total_cost = Math.max(0, subtotal)
        }
        state.estimateData.total_cost = Number(getTotal())
    }

    // Función que obtiene el subtotal
    const getSubtotal = () => {
        const materialSubtotal = state.estimateMaterialData.reduce(
            (acc, item) => acc + parseFloat(item.total_price || 0), 0
        )
        const laborSubtotal = state.estimateLaborsData.reduce(
            (acc, item) => acc + parseFloat(item.total_cost || 0), 0
        )
        return Number(materialSubtotal + laborSubtotal).toFixed(2)
    }

    // Funcion que obtiene el total con el iva ya aplicado
    const getTotal = () => {
        //console.log("En getTotal");

        const subtotal = parseFloat(getSubtotal()) || 0
        const ivaPercent = parseFloat(state.estimateData?.iva) || 21
        const iva = ivaPercent / 100
        const total = subtotal * (1 + iva)
        //console.log("Total: ", Number(total).toFixed(2));

        return Number(total).toFixed(2)

    }
    async function loadEstimate(estimate_number = null) {
        try {
            state.clients = (await fetchClients()).data
            state.projects = (await fetchProjects()).data
            state.materials = (await fetchMaterials()).data
            state.laborTypes = (await fetchLaborTypes()).data
            // Solo si es modo edición (update)
            if (estimate_number) {
                const selected = (await fetchEstimate(estimate_number)).data
                state.selectedEstimate = selected

                // Estimate
                state.estimateData = EstimateData({
                    estimate_number: selected.estimate_number,
                    project_id: selected.project_id,
                    client_id: selected.client_id,
                    status: selected.status,
                    issue_date: selected.issue_date || today,
                    due_date: selected.due_date || today,
                    iva: selected.iva,
                    total_cost: selected.total_cost,
                    conditions: selected.conditions
                })

                // materials
                state.estimateMaterialData = selected.materials?.map((item) =>
                    estimateMaterialData({
                        estimate_material_id: item.estimate_material_id,
                        material_id: item.material_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        discount: item.discount,
                        total_price: item.total_price,
                        unit: item.material?.unit || "",  //opcional para mostrar en UI
                    })
                ) || []

                //labors
                state.estimateLaborsData = selected.labors?.map((item) =>
                    estimateLaborsData({
                        estimate_labor_id: item.estimate_labor_id,
                        labor_type_id: item.labor_type_id,
                        hours: item.hours,
                        cost_per_hour: item.cost_per_hour,
                        discount: item.discount,
                        total_cost: item.total_cost,
                        description: item.description,
                        //concept: item.labor_type?.name || "", opcional para mostrar en UI
                    })
                ) || []

            }
            m.redraw()
        } catch (error) {
            //console.error("Error cargando datos del formulario:", error)
        }
    }

    function validarStockMaterial(item) {
        const selected = state.materials.find(mat => mat.material_id == item.material_id)
        if (!selected) return

        const cantidad = Number(item.quantity) || 0
        const restante = selected.stock_quantity - cantidad

        if (restante <= 0) {
            Toastify({
                text: ` Stock insuficiente para "${selected.name}". (${selected.stock_quantity} disponibles)`,
                className: "toastify-error",
                duration: 4000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast()
            // Resetear selección
            item.quantity = 1
            updateConceptSubtotal(item)
            m.redraw()
            return
        }
        if (restante <= selected.min_stock_alert) {
            Toastify({
                text: ` Pocas unidades de "${selected.name}". Quedan ${restante}.`,
                className: "toastify-warning",
                duration: 4000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast()
        }
    }
    return {
        oncreate: ({ attrs }) => {
            loadEstimate(attrs.estimate_number)
        },
        view: ({ attrs }) => {
            const { type } = attrs
            // Btns Eliminar y Añadir concepto
            const btnsAction = ({ key, createConcept }) => {
                const isEmpty = state[key]?.length === 0
                return m("div", { class: "col-12 mt-4 d-flex justify-content-center" }, [
                    m("div", { class: "col-md-8 d-flex flex-column flex-md-row justify-content-between gap-4" }, [
                        // Botón Eliminar
                        m(Button, {
                            bclass: "btn btn-danger text-nowrap",
                            disabled: isEmpty,
                            actions: () => state[key]?.pop(),
                        }, ["Eliminar concepto", m("i.fa.fa-trash-can.me-2.ms-2", { style: { color: "white" } })]),
                        // Botón Añadir
                        m(Button, {
                            bclass: "btn-warning text-nowrap",
                            actions: () => state[key]?.push(createConcept()),
                        }, ["Añadir concepto", m("i.fa.fa-plus.me-2.ms-2")])
                    ])
                ])
            }
            // Cabecerad el formularioi
            const renderHeader = () => [
                m("span", { class: "fw-semibold text-uppercase fs-5 py-3" }, "Cabecera del documento"),
                m("div", { class: "row col-12 p-0 m-0" }, [
                    // Cliente input
                    m("div", { class: "col-md-6 col-lg-3" }, [
                        m("div", { class: "col-12 py-1" }, [
                            m("label.form-label.ps-1", "Cliente *"),
                            m("select.form-select my-choices", {
                                style: { ...style._input_secondary },
                                id: "client_id",
                                name: "client_id",
                                value: parseInt(state.estimateData?.client_id) || "",
                                onchange: e => {
                                    state.estimateData.client_id = parseInt(e.target.value)
                                    m.redraw()
                                },
                                onupdate: ({ dom }) => {
                                    if (!dom.choicesInstance && Array.isArray(state.clients) && state.clients.length > 0) {
                                        dom.choicesInstance = new Choices(dom, {
                                            allowHTML: false,
                                            shouldSort: false,
                                            searchPlaceholderValue: "Buscar cliente...",
                                            itemSelectText: '',
                                        })
                                    }
                                    if (dom.choicesInstance && state.estimateData?.client_id) {
                                        dom.choicesInstance.setChoiceByValue(state.estimateData.client_id.toString());
                                    }
                                },
                                onremove: ({ dom }) => {
                                    if (dom.choicesInstance) {
                                        dom.choicesInstance.destroy()
                                    }
                                }
                            }, [
                                m("option", {
                                    value: "",
                                    disabled: true,
                                    selected: !state.estimateData?.client_id
                                }, "-- Selecciona Cliente --"),
                                ...(Array.isArray(state.clients) ? state.clients.map(opt =>
                                    m("option", {
                                        value: parseInt(opt.client_id)
                                    }, opt.name || opt.content || "Sin nombre")
                                ) : [])
                            ])
                        ]),
                    ]),
                    //projecto input
                    m("div", { class: "col-md-6 col-lg-3" }, [
                        m("div", { class: "col-12 py-1" }, [
                            m("label.form-label.ps-1", "Proyecto *"),
                            m("select.form-select my-choices", {
                                style: { ...style._input_secondary },
                                id: "project_id",
                                name: "project_id",
                                value: parseInt(state.estimateData?.project_id) || "",
                                onchange: e => {
                                    state.estimateData.project_id = parseInt(e.target.value)
                                    m.redraw()
                                },
                                onupdate: ({ dom }) => {
                                    if (!dom.choicesInstance && Array.isArray(state.projects) && state.projects.length > 0) {
                                        dom.choicesInstance = new Choices(dom, {
                                            allowHTML: false,
                                            shouldSort: false,
                                            searchPlaceholderValue: "Buscar proyecto...",
                                            itemSelectText: '',
                                        })
                                    }
                                    if (dom.choicesInstance && state.estimateData?.project_id) {
                                        dom.choicesInstance.setChoiceByValue(state.estimateData.project_id.toString());
                                    }
                                },
                                onremove: ({ dom }) => {
                                    if (dom.choicesInstance) {
                                        dom.choicesInstance.destroy()
                                    }
                                }
                            }, [
                                m("option", {
                                    value: "",
                                    disabled: true,
                                    selected: !state.estimateData?.project_id
                                }, "-- Selecciona Proyecto --"),
                                ...(Array.isArray(state.projects) ? state.projects.map(opt =>
                                    m("option", {
                                        value: parseInt(opt.project_id)
                                    }, opt.name || opt.content || "Sin nombre")
                                ) : [])
                            ])
                        ]),
                    ]),
                    // Estado y IVA
                    m("div", { class: "col-md-6 col-lg-3" }, [
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "Estado *"),
                            m("select.form-select", {
                                oncreate: () => {
                                    state.estimateData.status = "Pendiente"
                                },
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                style: { ...style._input_secondary },
                                id: "status",
                                name: "status",
                                value: state.estimateData?.status || "Pendiente",
                                onchange: e => {
                                    state.estimateData.status = e.target.value
                                    m.redraw()
                                }
                            }, [
                                m("option", { value: "", disabled: true, selected: !state.estimateData?.status }, "-- Selecciona Estado--"),
                                ...status.map(opt =>
                                    m("option", { value: opt.value }, opt.value)
                                )
                            ])
                        ]),
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "IVA *"),
                            m("select.form-select", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                style: { ...style._input_secondary },
                                id: "iva",
                                value: Number(state.estimateData?.iva),
                                onchange: e => {
                                    state.estimateData.iva = Number(e.target.value)
                                    //console.log(state.estimateData.iva);

                                    m.redraw()
                                }
                            }, [
                                m("option", { value: "", disabled: true, selected: !state.estimateData?.iva }, "-- Selecciona --"),
                                ...taxes.map(opt =>
                                    m("option", { value: Number(opt.value) }, opt.content)
                                )
                            ])
                        ]),
                    ]),
                    // Fechas
                    m("div", { class: "col-md-6 col-lg-3" }, [
                        // Fecha de creación
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "Creación *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                style: { ...style._input_secondary },
                                type: "date",
                                id: "issue_date",
                                name: "issue_date",
                                value: state.estimateData?.issue_date || today,
                                max: today,
                                oninput: e => {
                                    state.estimateData.issue_date = e.target.value
                                    m.redraw()
                                }
                            })
                        ]),
                        // Fecha de expiración
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "Expiración *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                style: { ...style._input_secondary },
                                type: "date",
                                id: "due_date",
                                name: "due_date",
                                value: state.estimateData?.due_date || today,
                                min: today,
                                oninput: e => {
                                    state.estimateData.due_date = e.target.value
                                    m.redraw()
                                }
                            })
                        ]),
                    ]),
                    m("hr.mt-4")
                ])]
            // Conceptos materiales
            const renderEstimateMaterialData = (item, index) => {
                return m("div", { class: "row p-0 m-0 my-2 d-flex justify-content-between" }, [
                    m("input", { type: "hidden", value: item.material_id }),
                    m("div", { class: "col-lg-12 row" }, [
                        //material
                        m("div", { class: "col-md-6 col-lg-4 pt-2" }, [
                            m("label.form-label.ps-1", `Material * #${index + 1}`),
                            m("select.form-select", {
                                id: "material",
                                name: "material",
                                style: { ...style._input_secondary },
                                value: parseInt(item.material_id) || "",
                                onchange: e => {
                                    item.material_id = parseInt(e.target.value)
                                    const selected = state.materials.find(mat => mat.material_id == item.material_id)
                                    if (selected) {
                                        item.unit = selected.unit || "N/A"
                                        item.unit_price = parseFloat(selected.price_per_unit) || 0
                                        item.quantity = 1
                                        item.discount = 0
                                        updateConceptSubtotal(item)
                                    }
                                    m.redraw()
                                },
                                onupdate: ({ dom }) => {
                                    if (!dom.choicesInstance && Array.isArray(state.materials) && state.materials.length > 0) {
                                        dom.choicesInstance = new Choices(dom, {
                                            allowHTML: false,
                                            shouldSort: false,
                                            searchPlaceholderValue: "Buscar material...",
                                            itemSelectText: '',
                                        })
                                    }
                                    if (dom.choicesInstance && item?.material_id) {
                                        dom.choicesInstance.setChoiceByValue(item.material_id.toString());
                                    }
                                },
                                onremove: ({ dom }) => {
                                    if (dom.choicesInstance) {
                                        dom.choicesInstance.destroy()
                                    }
                                }
                            }, [
                                m("option", {
                                    value: "",
                                    disabled: true,
                                    selected: !item.material_id
                                }, "-- Selecciona Material --"),
                                ...(Array.isArray(state.materials)
                                    ? (state.materials).map(opt => m("option", { value: parseInt(opt.material_id) }, opt.name || opt.content || "Sin nombre")

                                    )
                                    : [])
                            ])
                        ]),
                        // Espacio en blanco
                        m("div.col-md-3.col-lg-8.pt-2"),
                        // Cantidad
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Cantidad *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                id: "quantity",
                                name: "quantity",
                                style: { ...style._input_secondary },
                                type: "number",
                                min: 0,
                                value: item.quantity,
                                oninput: e => {
                                    item.quantity = +e.target.value
                                    validarStockMaterial(item)
                                    updateConceptSubtotal(item)
                                    m.redraw()
                                }
                            })
                        ]),
                        // Unidad
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Unidad *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: item.unit || "N/A"
                            })
                        ]),
                        // Precio unitario
                        m("div.col-md-3.col-lg-3.pt-2", [
                            m("label.form-label.ps-1", "P / U *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                id: "unit_price",
                                name: "unit_price",
                                style: { ...style._input_secondary },
                                type: "number",
                                min: 0,
                                step: "any",
                                value: item.unit_price,
                                oninput: e => {
                                    item.unit_price = +e.target.value
                                    updateConceptSubtotal(item)
                                }
                            })
                        ]),
                        // Descuento
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Descuento"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                id: "discount",
                                name: "discount",
                                type: "number",
                                step: "any",
                                min: 0,
                                value: item.discount,
                                oninput: e => {
                                    item.discount = +e.target.value
                                    updateConceptSubtotal(item)
                                }
                            })
                        ]),
                        // SubTotal
                        m("div.col-md-3.col-lg-3.pt-2", [
                            m("label.form-label.ps-1", "SubTotal"),
                            m("input.text-end.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: `${Number(item.total_price ?? 0).toFixed(2)} €`
                            })
                        ]),
                    ]),
                ])
            }
            // Conceptos Servicios
            const renderEstimateLaborsData = (item, index) => {
                return m("div", { class: "row col-12 p-0 m-0 my-2" }, [
                    m("input", { type: "hidden", value: item.labor_type_id }),
                    m("div", { class: "col-lg-12 row" }, [
                        //Labor type
                        m("div", { class: "col-md-6 col-lg-4 pt-2" }, [
                            m("label.form-label.ps-1", `Servicio * #${index + 1}`),
                            m("select.form-select my-choices", {
                                id: "labor_type",
                                name: "labor_type",
                                style: { ...style._input_secondary },
                                value: parseInt(item.labor_type_id) || "",
                                onchange: e => {
                                    item.labor_type_id = parseInt(e.target.value)
                                    const selected = state.laborTypes.find(l => l.labor_type_id == item.labor_type_id)
                                    if (selected) {
                                        item.cost_per_hour = parseFloat(selected.cost_per_hour) || 0
                                        item.hours = 1
                                        item.discount = 0
                                        item.description = selected.description || ""
                                        updateConceptSubtotal(item)
                                    }
                                    m.redraw()
                                },
                                onupdate: ({ dom }) => {
                                    if (!dom.choicesInstance && Array.isArray(state.laborTypes) && state.laborTypes.length > 0) {
                                        dom.choicesInstance = new Choices(dom, {
                                            allowHTML: false,
                                            shouldSort: false,
                                            searchPlaceholderValue: "Buscar servicio...",
                                            itemSelectText: '',
                                        })
                                    } if (dom.choicesInstance && item?.labor_type_id) {
                                        dom.choicesInstance.setChoiceByValue(item.labor_type_id.toString());
                                    }
                                },
                                onremove: ({ dom }) => {
                                    if (dom.choicesInstance) {
                                        dom.choicesInstance.destroy()
                                    }
                                }
                            }, [
                                m("option", {
                                    value: "",
                                    disabled: true,
                                    selected: !item.labor_type_id
                                }, "-- Selecciona Servicio --"),
                                ...(Array.isArray(state.laborTypes)
                                    ? (state.laborTypes).map(opt =>
                                        m("option", { value: parseInt(opt.labor_type_id) }, opt.name || opt.content || "Sin nombre")
                                    )
                                    : [])
                            ])
                        ]),
                        // Espacio en blanco
                        m("div.col-md-6.d-lg-6.pt-2"),
                        // Descripción
                        m("div.col-md-12.col-lg-12.pt-2", [
                            m("label.form-label.ps-1", "Descripción *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                id: "description",
                                name: "description",
                                required: true,
                                style: { ...style._input_secondary },
                                value: item.description || "",
                                oninput: e => item.description = e.target.value
                            })
                        ]),
                        //Espacio en blanco
                        m("div.col-lg-2.pt-2"),
                        // Horas
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Horas *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                id: "hours",
                                name: "hours",
                                style: { ...style._input_secondary },
                                type: "number",
                                min: 0,
                                value: item.hours,
                                oninput: e => {
                                    item.hours = +e.target.value
                                    updateConceptSubtotal(item)
                                }
                            })
                        ]),
                        // Precio por hora
                        m("div.col-md-3.col-lg-3.pt-2", [
                            m("label.form-label.ps-1", " P / H *"),
                            m("input.form-control", {
                                class: (badForm ? " is-invalid" : ""),
                                required: true,
                                id: "price_per_hour",
                                name: "price_per_hour",
                                style: { ...style._input_secondary },
                                type: "number",
                                min: 0,
                                step: "any",
                                value: item.cost_per_hour,
                                oninput: e => {
                                    item.cost_per_hour = +e.target.value
                                    updateConceptSubtotal(item)
                                }
                            })
                        ]),
                        // Descuento
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Descuento"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                id: "discount",
                                name: "discount",
                                type: "number",
                                step: "any",
                                min: 0,
                                value: item.discount,
                                oninput: e => {
                                    item.discount = +e.target.value
                                    updateConceptSubtotal(item)
                                }
                            })
                        ]),
                        // Subtotal
                        m("div.col-md-3.col-lg-3.pt-2", [
                            m("label.form-label.ps-1", "SubTotal"),
                            m("input.text-end.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: `${Number(item.total_cost ?? 0).toFixed(2)} €`
                            })
                        ]),
                    ]),
                ])
            }
            // Cuerpo del formulario con los conceptos renderizados
            const renderConcepts = () => [
                // Conceptos
                m("h5", "Conceptos"),
                m("hr"),
                m("h6", "Materiales"),
                // Conceptos de materiales
                ...state.estimateMaterialData?.map(renderEstimateMaterialData),
                btnsAction({
                    key: "estimateMaterialData",
                    createConcept: estimateMaterialData
                }),
                m("hr.mt-5"),
                m("h6", "Servicios"),
                // Conceptos de mano de obra
                ...state.estimateLaborsData?.map(renderEstimateLaborsData),
                btnsAction({
                    key: "estimateLaborsData",
                    createConcept: estimateLaborsData
                }),
            ]
            // Condiciones, subtotal, iva y btns volver y aceptar
            const renderFoot = () => [
                m("div", [
                    m("label.form-label.ps-1", 'Condiciones del presupuesto'),
                    m("input.form-control.py-3", {
                        style: { ...style._input_main },
                        id: 'conditions',
                        value: state.estimateData?.conditions,
                        oninput: e => {
                            state.estimateData.conditions = e.target.value
                            m.redraw()
                        },
                    })
                ]),
                // Totales
                m("div.row.mt-5", [
                    m("div.col-md-3.offset-md-9", [
                        m("div.d-flex.flex-column.gap-3", [
                            m("div.form-group", [
                                m("label.form-label", "Subtotal"),
                                m("input.form-control.text-end[readonly]", {
                                    style: { ...style._input_main },
                                    value: `${getSubtotal()} €`
                                })
                            ]),
                            m("div.form-group", [
                                m("label.form-label", "IVA"),
                                m("input.form-control.text-end[readonly]", {
                                    style: { ...style._input_main },
                                    value: `${Number(state.estimateData?.iva) || 21} %`
                                })
                            ]),
                            m("div.form-group", [
                                m("label.form-label.fw-bold", "TOTAL"),
                                m("input.form-control.text-end.fw-bold[readonly]", {
                                    style: { ...style._input_main },
                                    value: `${getTotal()} €`
                                })
                            ]),
                        ])
                    ])
                ])
                ,
                // Botones
                m("div.col-12.d-flex.justify-content-center.my-5", [
                    m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                        m(Button, {
                            bclass: "btn-warning ",
                            actions: () => new bootstrap.Modal(document.getElementById("ModalCancelation")).show()
                            ,
                        }, [m("i.fa.fa-arrow-left.me-2.ms-2"), "Volver",]),
                        m(Button, {
                            type: "submit",
                            bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                            style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" },
                        }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                    ])
                ])
            ]

            //console.log(state.estimateMaterialData);


            //Formulario completo y renderizado
            return m("div",
                {
                    class: "col-11 col-md-10 d-flex flex-column justify-content-center align-items-center p-3 overflow-hidden",
                    style: { backgroundColor: "var(--mainWhite)", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }
                }, [
                m("form", {
                    class: "row col-12",
                    onsubmit: e => handleFormSubmit(e, type)
                }, [
                    m("hr"),
                    renderHeader(),
                    renderConcepts(),
                    m("hr.mt-5"),
                    renderFoot(),
                    m("hr"),
                ])
            ])
        }
    }
}
