import { ModalComponent, ModalConfirmation, ButtonComponent } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchMaterials, updateMaterial, createMaterial, deleteMaterial } from "../../Services/services.js";

export function MaterialsListPage() {
    let materials = [];
    let selectedMaterial = null;

    async function loadMaterials() {
        materials = (await fetchMaterials()).data;
        console.log(materials);
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
                    await deleteMaterial(selectedMaterial.material_id);
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
                m(TableListComponent, {
                    columns: columns,
                    data: normalizedMaterials,
                    onRowClick: onSelect
                }, [m(ButtonComponent,
                    {
                        type: "submit",
                        bclass: "btn text-white py-md-2 text-nowrap rounded-pill fw-normal", style: { backgroundColor: "var(--mainPurple)" },
                        actions: () => {
                            selectedMaterial = null;
                            //m.route.set("/materials/create")
                            new bootstrap.Modal(document.getElementById("ModalFormClient")).show();
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
                    onClientSaved: loadMaterials
                }
                ),
                m(ModalConfirmation, {
                    idModal: "ModalDeleteClient",
                    tituloModal: "Confirmación de eliminación",
                    mensaje: `¿Está seguro de eliminar el material con nombre ${selectedMaterial?.namer}?`,
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
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-danger",
                    actions: () =>
                        new bootstrap.Modal(document.getElementById("ModalDeleteClient")).show()
                }, [
                    m("i.fa-solid.fa-trash-can.text-white"),
                    " Eliminar Material"
                ]),
                m(ButtonComponent, {
                    closeModal: true,
                    bclass: "btn-warning",
                    actions: () => {
                        //m.route.set(`/materials/update/${selectedMaterial.material_id}`)
                        //m.route.set("/materials/create")
                        new bootstrap.Modal(document.getElementById("ModalFormClient")).show();
                        m.redraw();
                    }
                }, [
                    m("i.fa-solid.fa-pen-to-square"),
                    " Editar Material"
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
                    m("h5.mt-1", "Detalles del material"),
                    Table({ columns: columnMaterial, data: selectedMaterial ? [selectedMaterial] : [] }),
                    m("hr"),
                    m("h5.mt-3", "Movimientos de Stock"),
                    Table({ columns: columnsStockMovement, data: normalizedStockMovements || [] }),
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
            const handleFormSubmit = async (e) => {
                e.preventDefault()
                const dataToSend = state.MaterialData
                console.log("dataToSend: ", dataToSend);
                //console.log("Se envió");

                  try {
                     let response;
                     if (!!state.selectedMaterial) {
                         response = await updateMaterial(dataToSend, state.selectedMaterial.material_id);
                     } else {
                         response = await createMaterial(dataToSend);
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
                     attrs.onClientSaved?.(); // Llama al callback si existe
 
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
                idModal: "ModalFormClient",
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
