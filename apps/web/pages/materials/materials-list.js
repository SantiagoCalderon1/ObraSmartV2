import Choices from 'choices.js'
import 'choices.js/public/assets/styles/choices.min.css'

import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Table } from "../../components/table.js"
import { Button } from "../../components/button.js"

// IMPORTADOR DE FUNCIONES
import { fetchMaterials, fetchProjects, updateMaterial, createMaterial, deleteMaterial, createStockMovement } from "../../Services/services.js"
import { SpinnerLoading } from '../../components/spinner-loading.js'
import { TableModal } from '../../components/table-modal.js'

let style = {
    _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
    _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
}

export function MaterialsListPage() {
    let materials = []
    let selectedMaterial = null
    let lastUpdated = Date.now()


    async function loadMaterials() {
        materials = (await fetchMaterials()).data
        lastUpdated = Date.now()

        m.redraw()
    }
    return {
        oncreate: loadMaterials,
        view: function () {
            const onSelect = (material) => {
                selectedMaterial = material
                new bootstrap.Modal(document.getElementById("ModalDetailsMaterialsList")).show()
                m.redraw()
            }

            const onDelete = async () => {
                if (selectedMaterial) {
                    try {
                        let response = await deleteMaterial(selectedMaterial.material_id)
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
                        selectedMaterial = null
                        await loadMaterials()
                        m.redraw()
                    }
                }
            }

            const columns = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Stock", field: "stock_quantity", style: (item) => ({
                        color: item?.stock_quantity > item?.min_stock_alert ? "green" : item?.stock_quantity < item?.min_stock_alert ? "red" : "yellow"
                    })
                },
                { title: "P / U", field: "price_per_unit", euroSign: "€", style: () => ({ textWrap: "nowrap" }) }
            ]

            const normalizedMaterials = (materials || []).map((e, i) => ({
                ...e,
                index: i + 1,
            }))

            if (materials.length === 0) { return m(SpinnerLoading) }

            return [
                m("h1.py-5.text-uppercase", "Materiales"),
                m("div.col-10.d-flex.justify-content-center.align-items-center", { style: { maxWidth: "1400px" } }, [
                    m(Table, {
                        key: lastUpdated,
                        columns: columns,
                        data: normalizedMaterials,
                        onRowClick: onSelect,
                        style: { height: "70vh", width: "100%" }
                    }, [m(Button,
                        {
                            key: "crear",
                            type: "submit",
                            bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                            style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: () => {
                                selectedMaterial = null
                                new bootstrap.Modal(document.getElementById("ModalFormMaterial")).show()
                                m.redraw()
                            }
                        },
                        ["Crear Material"]
                    ),]),
                ]),
                m(ModalDetailsComponent, {
                    selectedMaterial: selectedMaterial,
                }),
                m(ModalFormComponent, {
                    selectedMaterial: selectedMaterial,
                    onMaterialSaved: loadMaterials
                }),
                m(ModalStockFormComponent, {
                    selectedMaterial: selectedMaterial,
                    onStockMovementSaved: loadMaterials
                }),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteMaterial",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el material con nombre ${selectedMaterial?.name}?`,
                    actions: onDelete
                })
            ]
        }
    }
}


function ModalDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { selectedMaterial = {} } = attrs

            const columnMaterial = [
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                { title: "Unidad", field: "unit" },
                { title: "P / U", field: "price_per_unit", euroSign: "€", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Stock", field: "stock_quantity", style: (item) => ({
                        color: item?.stock_quantity > item?.min_stock_alert ? "green" : item?.stock_quantity < item?.min_stock_alert ? "red" : "yellow"
                    })
                },
                { title: "Min Stock Alert", field: "min_stock_alert", style: () => ({ textWrap: "nowrap" }) },
            ]

            const columnsStockMovement = [
                { title: "#", field: "index" },
                { title: "Projecto", field: "project.name" },
                { title: "Cantidad", field: "quantity" },
                { title: "Razón", field: "reason" },
            ]

            const normalizedStockMovements = (selectedMaterial?.stock_movements || []).map((m, i) => ({
                ...m,
                index: i + 1,
                "project.name": m?.project?.name || ""
            }))

            // Header con botones
            const ContentHeaderModal = () => [
                m(Button, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteMaterial")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Material"
                ]),
                m(Button, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => {
                        new bootstrap.Modal(document.getElementById("ModalFormMaterial")).show()
                        m.redraw()
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Material"
                ]),
            ]

            // Body con las dos tablas
            const ContentBodyModal = () =>
                m("div", { style: { maxHeight: "60vh", overflowY: "auto", padding: "1rem" } }, [
                    m("h5.mt-1", "Detalles del material"),
                    m(TableModal, { columns: columnMaterial, data: selectedMaterial ? [selectedMaterial] : [] }),
                    m("hr"),
                    m("h5.mt-3", "Movimientos de Stock"),
                    m(TableModal, { columns: columnsStockMovement, data: normalizedStockMovements || [] }),
                ])

            // Footer con botón de PDF
            const ContentFooterModal = () => [
                m(Button, {
                    closeModal: true,
                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" }, actions: () => {
                        new bootstrap.Modal(document.getElementById("ModalFormStockMovement")).show()
                        m.redraw()
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square.text-light"),
                    " Generar Movimiento de stock"
                ])
            ]

            return m(Modal, {
                idModal: "ModalDetailsMaterialsList",
                title: `Material  ${selectedMaterial?.name}`,
                addBtnClose: true,
                slots: {
                    header: ContentHeaderModal(),
                    body: ContentBodyModal(),
                    footer: ContentFooterModal()
                }
            })
        }
    }
}

function ModalFormComponent() {
    let badForm = false
    let formElement = null

    const units = [{ value: "kg" }, { value: "m2" }, { value: "lt" }, { value: "unidades" }]

    const MaterialData = ({
        name = "",
        unit = "unidades",
        price_per_unit = 0,
        stock_quantity = 0,
        min_stock_alert = 0
    } = {}) => ({
        name,
        unit,
        price_per_unit,
        stock_quantity,
        min_stock_alert
    })

    const state = {
        MaterialData: MaterialData(),
        selectedMaterial: null
    }

    return {
        oninit: ({ attrs }) => {
            state.selectedMaterial = attrs.selectedMaterial
            state.MaterialData = MaterialData(attrs.selectedMaterial || {})
        },
        onupdate: ({ attrs }) => {
            if (attrs.selectedMaterial !== state.selectedMaterial) {
                state.selectedMaterial = attrs.selectedMaterial
                state.MaterialData = MaterialData(state.selectedMaterial || {})
            }
        },
        view: function ({ attrs }) {
            const handleFormSubmit = async () => {
                const dataToSend = state.MaterialData
                try {
                    let response
                    if (!!state.selectedMaterial) {
                        response = await updateMaterial(dataToSend, state.selectedMaterial.material_id)
                    } else {
                        response = await createMaterial(dataToSend)
                    }

                    const modalElement = document.getElementById("ModalFormMaterial")
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement)
                        modalInstance.hide()
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
                    attrs.onMaterialSaved?.() // Llama al callback si existe
                    m.redraw()
                    state.MaterialData = MaterialData()
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
                    [m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Datos del material"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
                            // NOmbre
                            m("div", { class: "col-md-12 col-lg-6 pt-2" }, [
                                m("label.form-label.ps-1", `Nombre *`),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.MaterialData.name,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => state.MaterialData.name = e.target.value
                                })
                            ]),
                            // Espacio en blanco
                            m("div.col-md-12.col-lg-6.pt-2"),
                            // Unidad
                            m("div.col-md-12.col-lg-3.pt-2", [
                                m("label.form-label.ps-1", "Unidad *"),
                                m("select.form-select", {
                                    class: (badForm ? " is-invalid" : ""),
                                    required: true,
                                    style: { ...style._input_secondary },
                                    value: state.MaterialData?.unit || "unidades",
                                    onchange: e => { state.MaterialData.unit = e.target.value; m.redraw() }
                                }, [
                                    ...units.map(opt =>
                                        m("option", { value: opt.value }, opt.value)
                                    )
                                ])
                            ]),
                            // Precio por unidad
                            m("div.col-md-12.col-lg-3.pt-2", [
                                m("label.form-label.ps-1", "P / U *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.MaterialData.price_per_unit,
                                    type: "number",
                                    min: 0,
                                    step: "any",
                                    required: true,
                                    oninput: (e) => state.MaterialData.price_per_unit = +e.target.value
                                })
                            ]),
                            // Cantidad de stock
                            m("div.col-md-12.col-lg-3.pt-2", [
                                m("label.form-label.ps-1", "Stock *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.MaterialData.stock_quantity,
                                    type: "number",
                                    min: 0,
                                    required: true,
                                    oninput: (e) => state.MaterialData.stock_quantity = +e.target.value
                                })
                            ]),
                            // Stock minimo
                            m("div.col-md-12.col-lg-3.pt-2", [
                                m("label.form-label.ps-1", "Alerta Stock *"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: state.MaterialData.min_stock_alert,
                                    type: "number",
                                    min: 0,
                                    required: true,
                                    oninput: (e) => state.MaterialData.min_stock_alert = +e.target.value
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
                                        state.MaterialData = MaterialData()
                                        m.redraw()
                                    }
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar",]),
                                m(Button, {
                                    type: "submit",
                                    actions: async (e) => {
                                        e.preventDefault()
                                        if (!formElement.checkValidity()) {
                                            formElement.reportValidity()
                                            return
                                        }
                                        await handleFormSubmit()
                                    },
                                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" },
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                            ])
                        ])
                    ])]])

            // Render del modal
            return m(Modal, {
                idModal: "ModalFormMaterial",
                maxHeight: false,
                title: state.selectedMaterial?.material_id ? `Actualizando El Material ${state.selectedMaterial?.name}` : `Creando Nuevo Material`,
                addBtnClose: false,
                slots: {
                    body: ContentBodyModal(),
                }
            })
        }
    }
}

function ModalStockFormComponent() {
    const motivos = [{ value: "ajuste" }, { value: "compra" }, { value: "uso" }]

    let formElement = null
    let badForm = false
    let choicesInstance = null

    const StockMovementData = ({
        material_id = "",
        project_id = "",
        quantity = 0,
        reason = "",
    } = {}) => ({
        material_id,
        project_id,
        quantity,
        reason
    })

    const state = {
        StockMovementData: StockMovementData(),
        projects: [],
    }

    return {
        oninit: async () => {
            state.projects = (await fetchProjects()).data
        },

        view: function ({ attrs }) {
            if (!state.StockMovementData.material_id && attrs.selectedMaterial?.material_id) {
                state.StockMovementData.material_id = attrs.selectedMaterial.material_id
            }
            const handleFormSubmit = async () => {
                try {
                    const dataToSend = state.StockMovementData
                    const response = await createStockMovement(dataToSend)

                    const modalElement = document.getElementById("ModalFormStockMovement")
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement)
                        modalInstance.hide()
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
                        text: "¡Error al crear movimiento!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast()
                } finally {
                    attrs.onStockMovementSaved?.()
                    state.StockMovementData = StockMovementData()
                    m.redraw()
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
                    m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Nuevo Movimiento de Stock"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
                            //  Cantidad
                            m("div.col-md-12.col-lg-6.pt-2", [
                                m("label.form-label.ps-1", "Cantidad *"),
                                m("input.form-control", {
                                    style: style._input_main,
                                    type: "number",
                                    min: 0,
                                    required: true,
                                    value: state.StockMovementData.quantity,
                                    oninput: (e) => state.StockMovementData.quantity = +e.target.value
                                })
                            ]),
                            //  Motivo
                            m("div.col-md-12.col-lg-6.pt-2", [
                                m("label.form-label.ps-1", "Motivo *"),
                                m("select.form-select", {
                                    style: style._input_main,
                                    required: true,
                                    value: state.StockMovementData.reason,
                                    onchange: (e) => state.StockMovementData.reason = e.target.value
                                }, [
                                    m("option", { value: "", disabled: true, selected: !state.StockMovementData.reason }, "Selecciona un motivo"),
                                    ...motivos.map(o => m("option", { value: o.value }, o.value))
                                ])
                            ]),
                            //projecto  
                            m("div.col-md-12.col-lg-12.pt-2", [
                                m("div", { class: "col-12 py-1" }, [
                                    m("div", { class: "col-12 py-1" }, [
                                        m("label.form-label.ps-1", "Proyecto *"),
                                        m("select.form-select", {
                                            class: badForm ? "is-invalid" : "",
                                            style: { ...style._input_secondary },
                                            id: "project_id",
                                            name: "project_id",
                                            value: parseInt(state.StockMovementData?.project_id) || "",
                                            onchange: e => {
                                                state.StockMovementData.project_id = parseInt(e.target.value)
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
                                                if (dom.choicesInstance && state.StockMovementData?.project_id) {
                                                    dom.choicesInstance.setChoiceByValue(state.StockMovementData.project_id.toString());
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
                                                selected: !state.StockMovementData?.project_id
                                            }, "-- Selecciona Proyecto --"),
                                            ...(Array.isArray(state.projects)
                                                ? (state.projects).map(opt =>
                                                    m("option", {
                                                        value: parseInt(opt.project_id)
                                                    }, opt.name || opt.content || "Sin nombre")
                                                )
                                                : [])
                                        ])
                                    ])
                                ]),
                            ]),
                        ]),
                        m("div.col-12.d-flex.justify-content-center.my-5", [
                            m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                                m(Button, {
                                    closeModal: true,
                                    bclass: "btn-danger",
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar"]),
                                m(Button, {
                                    type: "submit",
                                    actions: async (e) => {
                                        e.preventDefault()
                                        if (!formElement.checkValidity()) {
                                            formElement.reportValidity()
                                            return
                                        }
                                        await handleFormSubmit()
                                    },
                                    bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal",
                                    style: { backgroundColor: "var(--mainPurple)", border: "1px solid var(--mainPurple)" },
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })])
                            ])
                        ])
                    ])
                ])

            return m(Modal, {
                idModal: "ModalFormStockMovement",
                maxHeight: false,
                title: `Generando Movimiento de Stock en el material ${attrs.selectedMaterial?.name}`,
                addBtnClose: false,
                slots: {
                    body: ContentBodyModal()
                }
            })
        }
    }
}