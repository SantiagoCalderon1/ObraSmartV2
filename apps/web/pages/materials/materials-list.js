import Choices from 'choices.js';
import 'choices.js/public/assets/styles/choices.min.css';


import { Modal, ModalConfirmation } from "../../components/modal.js"
import { Table } from "../../components/table.js"

import { Button } from "../../components/button.js";
import { filterList } from "../../Util/util.js";


// IMPORTADOR DE FUNCIONES
import { fetchMaterials, fetchProjects, updateMaterial, createMaterial, deleteMaterial, createStockMovement } from "../../Services/services.js";

export function MaterialsListPage() {
    let materials = [];
    let selectedMaterial = null;

    async function loadMaterials() {
        materials = (await fetchMaterials()).data;
        //console.log(materials);
        m.redraw();
    }

    return {
        oncreate: loadMaterials,
        //onupdate: loadMaterials,
        view: function () {
            const onSelect = (material) => {
                selectedMaterial = material;
                new bootstrap.Modal(document.getElementById("ModalDetailsMaterialsList")).show();
                m.redraw();
            };

            const onDelete = async () => {
                if (selectedMaterial) {
                    let response = await deleteMaterial(selectedMaterial.material_id);
                    console.log(response);

                    selectedMaterial = null;
                    await loadMaterials();
                }
            };

            const columns = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "name", style: () => ({ textWrap: "nowrap" }) },
                {
                    title: "Stock", field: "stock_quantity", style: (item) => ({
                        color: item?.stock_quantity > item?.min_stock_alert ? "green" : item?.stock_quantity < item?.min_stock_alert ? "red" : "yellow"
                    })
                },
                { title: "P / U", field: "price_per_unit", euroSign: "€", style: () => ({ textWrap: "nowrap" }) }
            ];

            const normalizedMaterials = (materials || []).map((e, i) => ({
                ...e,
                index: i + 1,
            }));


            if (materials.length === 0) {
                return m("div.d-flex.justify-content-center.align-items-center", { style: { height: "30vh" } }, [
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ]);
            }

            return [
                m("h1.py-5.text-uppercase", "Materiales"),
                m(Table, {
                    columns: columns,
                    data: normalizedMaterials,
                    onRowClick: onSelect
                }, [m(Button,
                    {
                        type: "submit",
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                        actions: () => {
                            selectedMaterial = null;
                            //m.route.set("/materials/create")
                            new bootstrap.Modal(document.getElementById("ModalFormMaterial")).show();
                            m.redraw();
                        }
                    },
                    ["Crear Material"]
                ),]),
                m(ModalDetailsComponent, {
                    selectedMaterial: selectedMaterial,
                }),
                m(ModalFormComponent, {
                    selectedMaterial: selectedMaterial,
                    onMaterialSaved: loadMaterials
                }
                ),
                m(ModalStockFormComponent, {
                    selectedMaterial: selectedMaterial,
                    onStockMovementSaved: loadMaterials
                }
                ),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteMaterial",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el material con nombre ${selectedMaterial?.name}?`,
                    actions: onDelete
                })
            ];
        }
    };
}


function ModalDetailsComponent() {
    return {

        view: function ({ attrs }) {
            const { selectedMaterial = {}, } = attrs;


            // Columnas para tablas
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
            ];

            const columnsStockMovement = [
                { title: "#", field: "index" },
                { title: "Projecto", field: "project.name" },
                { title: "Cantidad", field: "quantity" },
                { title: "Razón", field: "reason" },
            ];


            const normalizedStockMovements = (selectedMaterial?.stock_movements || []).map((m, i) => ({
                ...m,
                index: i + 1,
                "project.name": m?.project?.name || ""
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
                        //m.route.set(`/materials/update/${selectedMaterial.material_id}`)
                        //m.route.set("/materials/create")
                        new bootstrap.Modal(document.getElementById("ModalFormMaterial")).show();
                        m.redraw();
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Material"
                ]),
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
                    m("h5.mt-1", "Detalles del material"),
                    Table({ columns: columnMaterial, data: selectedMaterial ? [selectedMaterial] : [] }),
                    m("hr"),
                    m("h5.mt-3", "Movimientos de Stock"),
                    Table({ columns: columnsStockMovement, data: normalizedStockMovements || [] }),
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
                    bclass: "btn-outline-warning",
                    actions: () => {
                        new bootstrap.Modal(document.getElementById("ModalFormStockMovement")).show();
                        m.redraw();
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square.text-warning"),
                    " Generar Movimiento de stock"
                ])
            ]

            // Render del modal
            return m(Modal, {
                idModal: "ModalDetailsMaterialsList",
                title: `Material  ${selectedMaterial?.name}`,
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
    let badForm = false
    let formElement = null;

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
            state.selectedMaterial = attrs.selectedMaterial;
            state.MaterialData = MaterialData(attrs.selectedMaterial || {});
        },
        onupdate: ({ attrs }) => {
            if (attrs.selectedMaterial !== state.selectedMaterial) {
                state.selectedMaterial = attrs.selectedMaterial;
                state.MaterialData = MaterialData(state.selectedMaterial || {});
                //console.log("state.selectedMaterial: ", state.selectedMaterial);
            }
        },

        view: function ({ attrs }) {
            const handleFormSubmit = async () => {

                const dataToSend = state.MaterialData
                //console.log("dataToSend: ", dataToSend);
                //console.log("Se envió");
                try {
                    let response;
                    if (!!state.selectedMaterial) {
                        response = await updateMaterial(dataToSend, state.selectedMaterial.material_id);
                    } else {
                        response = await createMaterial(dataToSend);
                    }

                    const modalElement = document.getElementById("ModalFormMaterial");
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement);
                        modalInstance.hide();
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
                    attrs.onMaterialSaved?.(); // Llama al callback si existe
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
                    [m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Datos del material"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
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
                            m("div.col-md-12.col-lg-6.pt-2"),
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
                idModal: "ModalFormMaterial",
                title: state.selectedMaterial?.material_id ? `Actualizando El Material ${state.selectedMaterial?.name}` : `Creando Nuevo Material`,
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

function ModalStockFormComponent() {

    let style = {
        _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
        _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
    };

    const motivos = [{ value: "ajuste" }, { value: "compra" }, { value: "uso" }];

    let formElement = null;
    let badForm = false;
    let choicesInstance = null;

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
    });

    const state = {
        StockMovementData: StockMovementData(),
        projects: [],
    };

    return {
        oninit: async ({ attrs }) => {
            state.projects = (await fetchProjects()).data;
        },

        onupdate: () => {
            // Refrescar Choices.js al cambiar la lista de proyectos
            if (choicesInstance && state.projects.length) {
                choicesInstance.clearChoices();
                choicesInstance.setChoices(
                    state.projects.map(opt => ({
                        value: opt.project_id,
                        label: opt.name || opt.content,
                        selected: opt.project_id === state.StockMovementData.project_id
                    })),
                    'value',
                    'label',
                    false
                );
            }
        },

        view: function ({ attrs }) {
            if (!state.StockMovementData.material_id && attrs.selectedMaterial?.material_id) {
                state.StockMovementData.material_id = attrs.selectedMaterial.material_id;
            } console.log("state.StockMovementData: ", state.StockMovementData);

            const handleFormSubmit = async () => {
                try {
                    console.log("Datos a enviar: ", state.StockMovementData);

                    const response = await createStockMovement(state.StockMovementData);

                    const modalElement = document.getElementById("ModalFormStockMovement");
                    if (modalElement) {
                        const modalInstance = bootstrap.Modal.getInstance(modalElement)
                            || new bootstrap.Modal(modalElement);
                        modalInstance.hide();
                    }

                    Toastify({
                        text: "¡Movimiento de stock creado!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();

                    attrs.onStockMovementSaved?.();
                } catch (error) {
                    Toastify({
                        text: "¡Error al crear movimiento!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();
                } finally {
                    m.redraw();
                }
            };

            const ContentBodyModal = () =>
                m("form", {
                    class: "row col-12",
                    onsubmit: (e) => {
                        e.preventDefault();
                        if (!formElement.checkValidity()) {
                            formElement.reportValidity();
                            return;
                        }
                        handleFormSubmit();
                    },
                    oncreate: (vnode) => {
                        formElement = vnode.dom;

                        const selectEl = vnode.dom.querySelector("#project_id");
                        if (selectEl && !choicesInstance) {
                            choicesInstance = new Choices(selectEl, {
                                searchEnabled: true,
                                itemSelectText: "",
                                shouldSort: false,
                                searchPlaceholderValue: "Filtrar proyectos...",
                                placeholder: true,
                            });

                            // Manejar selección
                            selectEl.addEventListener("change", (e) => {
                                state.StockMovementData.project_id = e.target.value;
                            });
                        }
                    }
                }, [
                    m("span", { class: "fw-semibold text-uppercase fs-3 py-3" }, "Nuevo Movimiento de Stock"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
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
                            m("div.col-md-12.col-lg-12.pt-2", [
                                m("label.form-label.ps-1", "Proyecto *"),
                                m("select.form-select", {
                                    class: (badForm ? " is-invalid" : ""),
                                    id: "project_id",
                                    style: { ...style._input_secondary },
                                    required: true
                                })
                            ])
                        ]),
                        m("div.col-12.d-flex.justify-content-center.my-5", [
                            m("div.col-md-8.d-flex.justify-content-between.gap-4", [
                                m(Button, {
                                    closeModal: true,
                                    bclass: "btn-danger",
                                }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar"]),
                                m(Button, {
                                    type: "submit",
                                    style: { backgroundColor: "var(--mainPurple)" }
                                }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })])
                            ])
                        ])
                    ])
                ]);

            return m(Modal, {
                idModal: "ModalFormStockMovement",
                title: `Generando Movimiento de Stock en el material ${attrs.selectedMaterial?.name}`,
                addBtnClose: false,
                slots: {
                    body: ContentBodyModal()
                }
            });
        }
    };
}