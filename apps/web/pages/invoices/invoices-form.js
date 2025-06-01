import { ModalConfirmation } from "../../components/modal.js"

import { Button } from "../../components/button.js";

// IMPORTADOR DE FUNCIONES
import {
    fetchEstimate,
    createInvoice,
} from "../../Services/services.js"


export function InvoicesFormPage() {
    return {
        view: function ({ attrs }) {
            const { type, estimate_number } = attrs
            const title = `Creando factura del Presupuesto #${estimate_number}`

            return [
                m("h1.text-center.fw-semibold.text-uppercase", { style: { padding: "2rem 1rem", textTransform: "uppercase" } }, title),
                m(EstimateFormComponent, {
                    type: type,
                    estimate_number: estimate_number // puede ser `undefined` en creación
                }),
                m(ModalConfirmation, {
                    idModal: "ModalCancelation",
                    tituloModal: "Confirmación de cancelación",
                    mensaje: "¿Está seguro de cancelar la creación de la factura?",
                    actions: () => {
                        m.route.set("/invoices")
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

    const EstimateData = ({
        estimate_number = "",
        project_id = "",
        client_id = "",
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
        name = "",
        material_id = "",
        quantity = 0,
        unit_price = 0,
        discount = 0,
        total_price = 0,
        unit = "N/A"
    } = {}) => ({
        name,
        material_id,
        quantity,
        unit_price,
        discount,
        total_price,
        unit
    })
    const estimateLaborsData = ({
        name = "",

        labor_type_id = "",
        hours = 0,
        cost_per_hour = 0,
        discount = 0,
        total_cost = 0,
        description = "",
    } = {}) => ({
        name,
        labor_type_id,
        hours,
        cost_per_hour,
        discount,
        total_cost,
        description
    })

    const invoiceData = ({
        estimate_id = "",
        issue_date = "",
        due_date = "",
        total_amount = "",
        pdf_url = ""
    } = {}) => ({
        estimate_id,
        issue_date,
        due_date,
        total_amount,
        pdf_url
    })


    const state = {
        invoiceData: invoiceData(),
        estimateData: EstimateData(),
        estimateMaterialData: [estimateMaterialData()],
        estimateLaborsData: [estimateLaborsData()],
        materials: [],
        laborTypes: [],
        selectedEstimate: null,
    }


    const handleFormSubmit = async (e) => {
        e.preventDefault()
        const dataToSend = state.invoiceData
        //console.log("dataToSend: ", dataToSend);
        //console.log("Se envió");
        try {
            state.isLoading = true
            const data = await createInvoice(dataToSend)
            //console.log("Response form: ", data)
            Toastify({
                text: "¡Operación exitosa!",
                className: "toastify-success",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast()
            m.route.set("/invoices")
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
    }
    // Función que obtiene el subtotal
    const getSubtotal = () => {
        const materialSubtotal = state.estimateMaterialData.reduce(
            (acc, item) => acc + parseFloat(item.total_price || 0), 0
        );
        const laborSubtotal = state.estimateLaborsData.reduce(
            (acc, item) => acc + parseFloat(item.total_cost || 0), 0
        );
        return Number(materialSubtotal + laborSubtotal).toFixed(2);
    };

    // Funcion que obtiene el total con el iva ya aplicado
    const getTotal = () => {
        const subtotal = parseFloat(getSubtotal())
        const iva = parseFloat(Number(state.estimateData?.iva) || 21) / 100
        return Number(subtotal * (1 + iva)).toFixed(2)
    }

    async function loadInvoices(estimate_number = null) {
        try {

            if (estimate_number) {
                const selected = (await fetchEstimate(estimate_number)).data;
                state.selectedEstimate = selected
                //console.log("selectedEstimate:", state.selectedEstimate)

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
                        name: item.material?.name || "",  //opcional para mostrar en UI
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
                        name: item.labor_type?.name || "",  //opcional para mostrar en UI
                        labor_type_id: item.labor_type_id,
                        hours: item.hours,
                        cost_per_hour: item.cost_per_hour,
                        discount: item.discount,
                        total_cost: item.total_cost,
                        description: item.description,
                    })
                ) || [];

                state.invoiceData = invoiceData({
                    estimate_id: selected.estimate_id,
                    issue_date: selected.issue_date,
                    due_date: selected.due_date,
                    total_amount: selected.total_cost,
                    pdf_url: selected.pdf_url || ""
                }) || []
            }
            m.redraw()
        } catch (error) {
            //console.error("Error cargando datos del formulario:", error)
        }
    }

    return {
        oncreate: ({ attrs }) => {
            loadInvoices(attrs.estimate_number)
        },
        view: ({ attrs }) => {
            const { type, estimate_number } = attrs
            // Cabecerad el formularioi
            const renderHeader = () => [
                m("hr.my-2"),
                m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Cabecera del documento"),
                m("div", { class: "row col-12 p-0 m-0" }, [
                    //m("div", { class: "col-md-6 col-lg-3" }),
                    //projecto input
                    m("div", { class: "col-md-6 col-lg-4" }, [
                        m("div", { class: "col-12 py-1" }, [
                            m("label.form-label.ps-1", "Proyecto "),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.project?.name || "N/A"
                            })
                        ]),
                    ]),
                    m("div", { class: "col-md-6 d-lg-none" }), ,
                    //presupueso input
                    m("div", { class: "col-md-6 col-lg-2" }, [
                        m("div", { class: "col-12 py-1" }, [
                            m("label.form-label.ps-1", "Presuspuesto "),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.estimate_number || "N/A"
                            })
                        ]),
                    ]),
                    m("div", { class: "col-md-6 col-lg-2" }, [
                        // Estado
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "Estado "),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.status || "N/A"
                            })
                        ]),
                    ]),
                    m("div", { class: "col-md-6 col-lg-2" }, [
                        // Fecha de creación
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "Creación *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                type: "date",
                                value: state.estimateData?.issue_date || today,
                            })
                        ]),
                    ]),
                    m("div", { class: "col-md-6 col-lg-2" }, [
                        // Fecha de expiración
                        m("div.col-12.py-2", [
                            m("label.form-label.ps-1", "Expiración *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                type: "date",
                                value: state.estimateData?.due_date || today,
                            })
                        ]),
                    ]),
                    m("hr.my-2")
                ])]
            const renderClient = () => [
                m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Datos del cliente"),
                m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                    m("div", { class: "row" }, [
                        m("div", { class: "col-md-6 col-lg-4 pt-2" }, [
                            m("label.form-label.ps-1", `Nombre`),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.client?.name || "N/A"
                            })
                        ]),
                        m("div.col-md-3.col-lg-8.pt-2"),
                        // NIF
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "NIF"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.client?.nif || "N/A"

                            })
                        ]),
                        // PHone
                        m("div.col-md-4.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Telefono *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.client?.phone || "N/A"
                            })
                        ]),
                        // Email
                        m("div.col-md-8.col-lg-4.pt-2", [
                            m("label.form-label.ps-1", "Email"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.client?.email || "N/A"
                            })
                        ]),
                        // address
                        m("div.col-md-12.col-lg-4.pt-2", [
                            m("label.form-label.ps-1", "Dirección"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: state.selectedEstimate?.client?.address || "N/A"
                            })
                        ]),
                    ]),
                ])
            ]
            // Conceptos materiales
            const renderEstimateMaterialData = (item, index) => {
                //console.log(item);

                return m("div", { class: "row   p-0  m-0 my-2 d-flex justify-content-between" }, [
                    m("input", { type: "hidden", value: item.material_id }),
                    m("div", { class: "row" }, [
                        m("div", { class: "col-md-6 col-lg-4 pt-2" }, [
                            m("label.form-label.ps-1", `Material * #${index + 1}`),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: item.name
                            })
                        ]),
                        // Espacio en blanco
                        m("div.col-md-3.col-lg-8.pt-2"),
                        // Cantidad
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Cantidad *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_secondary },
                                value: item.quantity,
                            })
                        ]),
                        // Unidad
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Unidad *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_secondary },
                                value: item.unit || "N/A"
                            })
                        ]),
                        // Precio unitario
                        m("div.col-md-3.col-lg-3.pt-2", [
                            m("label.form-label.ps-1", "P / U *"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: item.unit_price,
                            })
                        ]),
                        // Descuento
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Descuento"),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_secondary },
                                value: item.discount
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
                        m("div", { class: "col-md-6 col-lg-4 pt-2" }, [
                            m("label.form-label.ps-1", `Servicio * #${index + 1}`),
                            m("input.form-control[readonly]", {
                                style: { ...style._input_main },
                                value: item.name || "N/A"
                            })
                        ]),
                        // Espacio en blanco
                        m("div.col-md-6.d-lg-6.pt-2"),
                        // Descripción
                        m("div.col-md-12.col-lg-12.pt-2", [
                            m("label.form-label.ps-1", "Descripción *"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                value: item.description || "",
                                oninput: e => item.description = e.target.value
                            })
                        ]),
                        m("div.col-lg-2.pt-2"),
                        // Horas
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Horas *"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                value: item.hours,
                            })
                        ]),
                        // Precio por hora
                        m("div.col-md-3.col-lg-3.pt-2", [
                            m("label.form-label.ps-1", " P / H *"),
                            m("input.form-control", {
                                style: { ...style._input_main },
                                value: item.cost_per_hour,
                            })
                        ]),
                        // Descuento
                        m("div.col-md-3.col-lg-2.pt-2", [
                            m("label.form-label.ps-1", "Descuento"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                value: item.discount,
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
                m("hr.my-2"),
                m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Conceptos"),
                m("hr.my-2"),
                m("span", { class: "fw-semibold text-uppercase fs-4 py-3" }, "Materiales"),
                // Conceptos de materiales
                ...state.estimateMaterialData?.map(renderEstimateMaterialData),
                //btnsAction({ key: "estimateMaterialData", createConcept: estimateMaterialData }),
                m("hr.my-2"),
                m("span", { class: "fw-semibold text-uppercase fs-4 py-3" }, "Servicios"),
                // Conceptos de mano de obra
                ...state.estimateLaborsData?.map(renderEstimateLaborsData),
                //btnsAction({ key: "estimateLaborsData", createConcept: estimateLaborsData }),
            ]
            // Condiciones, subtotal, iva y btns volver y aceptar
            const renderFoot = () => [
                m("div", [
                    m("hr.my-2"),
                    m("label.form-label.ps-1", { class: "fw-semibold text-uppercase fs-4 py-3" }, 'Condiciones del presupuesto'),
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
                                m("label.form-label", { class: "fw-semibold text-uppercase fs-4 py-2" }, "Subtotal"),
                                m("input.form-control.text-end[readonly]", {
                                    style: { ...style._input_main },
                                    value: `${getSubtotal()} €`
                                })
                            ]),
                            m("div.form-group", [
                                m("label.form-label", { class: "fw-semibold text-uppercase fs-4 py-2" }, "IVA"),
                                m("input.form-control.text-end[readonly]", {
                                    style: { ...style._input_main },
                                    value: `${Number(state.estimateData?.iva) || 21} %`
                                })
                            ]),
                            m("div.form-group", [
                                m("label.form-label", { class: "fw-semibold text-uppercase fs-4 py-2" }, "TOTAL"),
                                m("input.form-control.text-end.fw-bold[readonly]", {
                                    style: { ...style._input_main },
                                    value: `${Number(state.estimateData.total_cost || getTotal()).toFixed(2)} €`
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
                            bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                            style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, type: "submit",
                        }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2.text-white")]),
                    ])
                ])
            ]

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
                    renderHeader(),
                    renderClient(),
                    renderConcepts(),
                    renderFoot(),
                    m("hr"),
                ])
            ])
        }
    }
}

