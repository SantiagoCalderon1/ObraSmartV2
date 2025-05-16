import { TableListComponent, ModalComponent, ButtonComponent } from "./generalsComponents.js";

/// IMPORTADOR DE CONSTANTES
import { URL_BUDGETS, URL_BUDGETS_DETAILS, URL_CLIENTS, URL_PROJECTS } from "../Util/constantes.js"

// IMPORTADOR DE FUNCIONES
import { request } from "../Util/util.js";


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
                    content = m(BudgetsFormCreatePage);
                    break;
                case "update":
                    content = m(BudgetsFormUpdatePage, { budget_number: attrs.id });
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
    let selectedBudget = null;
    let selectedBudgetDetails = null;

    return {

        oncreate: getBudgets,
        view: function () {
            return [
                m("h1", { style: { padding: "30px 0", textTransform: "uppercase" } }, "Presupuestos"),
                m(BudgetsListComponent, {
                    budgets: budgets,
                    onBudgetSelect: (budget, data) => {
                        selectedBudget = budget;
                        selectedBudgetDetails = data;
                        m.redraw();
                    }
                }),
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
                    actions: deleteBudget
                }),
            ]
        },
    }

    async function getBudgets() {
        try {
            const data = await request("GET", URL_BUDGETS);
            budgets = data.map((item, i) => ({ ...item, index: i + 1 }));
            m.redraw(); // Redibujamos la vista después de cargar los presupuestos
        } catch (error) {
            console.error("Error al obtener los presupuestos: ", error);
        }
        m.redraw();
    }

    async function deleteBudget() {
        try {
            // Usando la función request que has definido
            const data = await request("DELETE", `${URL_BUDGETS}/${selectedBudget?.budget_id}`);
            console.log("Data de eliminación: ", data);

            // Redirigir y redibujar después de la eliminación
            m.route.set("/budgets");
            m.redraw();
        } catch (error) {
            console.error("Error al eliminar el presupuesto: ", error);
        }
    }

}


function BudgetsListComponent() {
    return {
        view: function ({ attrs }) {
            const budgets = attrs.budgets
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
                { title: "ID Cliente", field: "client_id" },
                { title: "ID Proyecto", field: "project_id" },
                { title: "Total", field: "total", euroSign: "€" },
                { title: "Fecha", field: "date" }
            ];

            const onRowClick = (budget) => {
                m.request({ method: "GET", url: URLS.BudgetDetails + budget.budget_id, headers: { "Authorization": `Bearer ${token}` } })
                    .then((data) => {
                        attrs.onBudgetSelect(budget, data)
                        new bootstrap.Modal(document.getElementById("ModalDetailsBudgetsList")).show();
                        m.redraw()
                    })
                    .catch(() => { attrs.onBudgetSelect(budget, null); new bootstrap.Modal(document.getElementById("ModalDetailsBudgetsList")).show() })

            }
            return [
                m(TableListComponent, { columns: columns, data: budgets, onRowClick: onRowClick },
                    [m(ButtonComponent, { actions: () => m.route.set("/budget/create/0") }, ["Crear Presupuesto"])]
                )
            ]
        }
    };
}

















function BudgetsFormCreatePage() {
    return {
        view: function () {
            return [
                m("h1", { style: { padding: "30px 0", textTransform: "uppercase" } }, "Nuevo Presupuesto"),
                m(FormBudgetComponent, { typeForm: "create" }),
                m(BudgetModalConfirmation, {
                    idModal: "ModalCancelationBudget",
                    tituloModal: "Confirmación de cacelación",
                    mensaje: "¿Está seguro de cancelar la creación del nuevo presupuesto?",
                    actions: () => {
                        m.route.set("/budgets");
                        m.redraw();
                    }
                })
            ]
        }
    }
}

function BudgetsFormUpdatePage() {
    return {
        view: function ({ attrs }) {
            return [
                m("h1.text-center", { style: { padding: "30px 0", textTransform: "uppercase" } }, `Actualizando el Presupuesto ${attrs.budget_number}`),
                m(FormBudgetComponent, { typeForm: "update", budget_number: attrs.budget_number }),
                m(BudgetModalConfirmation, {
                    idModal: "ModalCancelationBudget",
                    tituloModal: "Confirmación de cancelación",
                    mensaje: "¿Está seguro de cancelar la actualización del presupuesto?",
                    actions: () => {
                        m.route.set("/budgets");
                        m.redraw();
                    }
                })
            ]
        }
    }
}

function BudgetModalDetailsComponent() {
    return {
        view: function ({ attrs }) {
            const { idModal, tituloModal, budget, budgetDetails } = attrs

            let total = 0
            if (budgetDetails) {
                total = budgetDetails.reduce((sum, item) => sum + Number(item.subtotal), 0);
            }

            const columns = [
                { title: "Concepto", field: "concept" },
                { title: "Descripción", field: "description" },
                { title: "Cantidad", field: "quantity" },
                { title: "Impuestos", field: "tax" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P/U", field: "unit_price", euroSign: "€" },
                { title: "Subtotal", field: "subtotal", euroSign: "€" }
            ];

            const ContentHeaderModal = () =>
                [
                    m(ButtonComponent, {
                        closeModal: true, bclass: "btn-danger", text: "Eliminar Presupuesto",
                        actions: () => new bootstrap.Modal(document.getElementById("ModalDeleteBudget"), { backdrop: true }).show()
                    },
                        m("i.fa-solid.fa-trash-can", { style: { color: "white" } })
                    ),
                    m(ButtonComponent, {
                        closeModal: true, bclass: "btn-warning", text: "Editar Presupuesto ",
                        actions: () => m.route.set(`/budget/update/${budget.budget_number}`)
                    },
                        m("i.fa-solid.fa-pen-to-square")
                    )]

            const ContentBodyModal = () =>
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
                                    m("tr.text-center", [m("td", (index + 1)), columns.map((col) => m("td", [detail[col.field] || "N/A", col.euroSign && detail[col.field] ? col.euroSign : ""]))])
                                )
                                : m("tr.text-center", m("td[colspan=8]", "No hay detalles disponibles"))),
                        m("tfoot", [
                            m("tr", m("th[colspan=8].text-end", `Total ${(+total).toFixed(2)} €`))
                        ])
                    ]),
                ])

            const ContentFooterModal = () =>
                m(ButtonComponent, { bclass: "btn-outline-danger", text: "Descargar PDF ", },
                    m("i.fa-solid.fa-file-pdf", { style: { color: "red" } })
                )

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
                        m("button.btn.btn-danger.mt-3.me-2", { "data-bs-dismiss": "modal", style: { fontWeight: "bold" } }, "Cancelar"),
                        m(ButtonComponent, {
                            closeModal: true,
                            class: "btn btn-success ",
                            actions: actions,
                            text: "Aceptar"
                        })
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

    const style = {
        containerStyle: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", overflow: "hidden" }
    }

    const today = new Date().toISOString().split("T")[0];
    const token = isAuthenticated()

    // Impuestos estaticos
    /* const taxes = [
        { value: 0, content: "0% IVA" },
        { value: 2, content: "2% IVA" },
        { value: 4, content: "4% IVA" },
        { value: 5, content: "5% IVA" },
        { value: 7.5, content: "7.5% IVA" },
        { value: 10, content: "10% IVA" },
        { value: 21, content: "21% IVA" },
        { value: 0, content: "0% IGIC" },
        { value: 3, content: "3% IGIC" },
        { value: 5, content: "5% IGIC" },
        { value: 7, content: "7% IGIC" },
        { value: 9.5, content: "9.5% IGIC" },
        { value: 13.5, content: "13.5% IGIC" },
        { value: 15, content: "15% IGIC" },
        { value: 20, content: "20% IGIC" },
        { value: 35, content: "35% IGIC" },
        { value: 0, content: "0% IPSI" },
        { value: 0.5, content: "0.5% IPSI" },
        { value: 1, content: "1% IPSI" },
        { value: 2, content: "2% IPSI" },
        { value: 3, content: "3% IPSI" },
        { value: 3.5, content: "3.5% IPSI" },
        { value: 4, content: "4% IPSI" },
        { value: 5, content: "5% IPSI" },
        { value: 6, content: "6% IPSI" },
        { value: 7, content: "7% IPSI" },
        { value: 8, content: "8% IPSI" },
        { value: 9, content: "9% IPSI" },
        { value: 10, content: "10% IPSI" }
    ] */

    const taxes = [
        { value: 10, content: "10% IVA" },
        { value: 21, content: "21% IVA" },
        { value: 3, content: "3% IGIC" },
        { value: 7, content: "7% IGIC" },
        { value: 4, content: "4% IPSI" },
        { value: 10, content: "10% IPSI" }
    ]

    // Opciones de estado
    const statusOptions = [
        { value: "Aceptado", content: "Aceptado" },
        { value: "Pendiente", content: "Pendiente" },
        { value: "Rechazado", content: "Rechazado" },
    ];

    const createHeaderDocument = ({
        inputClient = "",
        inputProject = "",
        inputStatus = "",
        inputCreation = today,
        inputExpiration = today,
    } = {}) => ({
        inputClient,
        inputProject,
        inputStatus,
        inputCreation,
        inputExpiration,
    });

    const createConcept = ({
        budget_concept_id = "",
        concept = "",
        quantity = 0,
        unit_price = 0,
        description = "",
        tax = 0,
        discount = 0,
        subtotal = 0
    } = {}) => ({
        budget_concept_id,
        concept,
        quantity,
        unit_price,
        description,
        tax,
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

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const dataToSend = collectFormData();

        // Validación básica
        if (!dataToSend.header.inputClient || !dataToSend.header.inputProject) {
            alert("Por favor, selecciona cliente y proyecto.");
            return;
        }

        console.log("DataToSend: ", dataToSend);


        if (!token) {
            console.log("No hay token, redirigiendo a /login")
            m.route.set("/login")
            return
        }

        console.log(dataToSend);
        console.log("method: ", state.selectedBudget ? "PUT" : "POST");

        console.log("URL: ", state.selectedBudget ? URLS.Budgets + "/" + state.selectedBudget.budget_id : URLS.Budgets);
        console.log("Token: ", token);
        state.isLoading = true;


        m.request({
            method: state.selectedBudget ? "PUT" : "POST", // "PUT" si estás actualizando
            url: state.selectedBudget ? URLS.Budgets + "/" + state.selectedBudget.budget_id : URLS.Budgets,
            body: dataToSend,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(response => {
            console.log("Formulario enviado con éxito:", response);
            // Aquí puedes redirigir, cerrar modal, o resetear formulario
            if (!state.selectedBudget) {
                // Solo si es CREAR (no UPDATE), resetea
                state.headerDocument = [createHeaderDocument()];
                state.conceptItems = [createConcept()];
            }
            Toastify({
                text: "¡Operación exitosa!",
                className: "toastify-success",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast();
        }).catch(err => {
            console.error("Error al enviar el formulario:", err);
            Toastify({
                text: "¡Algo salió mal!",
                className: "toastify-error",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right"
            }).showToast();
        }).finally(() => {
            state.isLoading = false;
        });
    }


    const fetchData = (url, mapFn = (x) => x) => {
        return m.request({
            method: "GET",
            url: url,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        }).then(data => mapFn(data)).catch(/* console.error */)
    }

    const totalBudget = () => state.conceptItems.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);

    const updateConceptSubtotal = (item) => {
        const tax = parseFloat(item.tax || 0);
        const quantity = parseFloat(item.quantity || 0);
        const unit_price = parseFloat(item.unit_price || 0);
        const discount = parseFloat(item.discount || 0);

        const pBruto = quantity * unit_price;
        const pNeto = pBruto * (1 + tax / 100);

        item.subtotal = Math.max(pNeto - discount, 0);
        m.redraw();
    };

    function generatePDF2() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const maxWidth = pageWidth * 0.8;  // 80% del ancho de la página

        //font size header
        const fontSizeTitle = 14
        const fontSizeSubtitle = 12
        const fontSizeText = 10

        //Diseño del Header
        const leftColumX = 20
        const leftColumnY = 45

        const rightColumnX = 80
        const rightColumnY = 15

        //Diseño de conceptos
        const startConceptX = 15
        const startConceptY = 90

        const startSummaryX = 15

        // Cargar el logo de la empresa (por ejemplo, imagen base64)
        const logo = "./assets/logosObraSmart/logo-1.png"; // Cambia esto por tu imagen en base64

        doc.setDrawColor(0); // Color negro
        doc.setLineWidth(0.5); // Grosor de la línea

        // Agregar logo
        doc.addImage(logo, 'PNG', leftColumX - 2.5, 10, 30, 25,); // Logo en la parte superior izquierda

        // Datos de la empresa debajo del logo
        // Limite del alineado a la derecha es 195
        doc.setFontSize(fontSizeTitle);
        doc.text("Empresa XYZ S.A.", leftColumX, leftColumnY,);
        doc.setFontSize(fontSizeText);
        doc.text("NIF/CIF: A1234567", leftColumX, leftColumnY + 5,);
        doc.text("Dirección: Calle Ficticia, 123", leftColumX, leftColumnY + 10,);
        doc.text("Teléfono: 123456789", leftColumX, leftColumnY + 15,);
        doc.text("Correo: info@empresa.com", leftColumX, leftColumnY + 20,);

        doc.line(75, 10, 75, 70); // Línea vertical

        // Datos del presupuesto (derecha)
        doc.setFontSize(fontSizeTitle);
        doc.text("Presupuesto:", rightColumnX, rightColumnY);
        doc.text("BGT-2025042506", rightColumnX, rightColumnY + 10); // Aquí va el número del presupuesto

        doc.setFontSize(fontSizeSubtitle);
        doc.text("Fecha de creación: 01/01/2025", rightColumnX + 50, rightColumnY);
        doc.text("Fecha de caducidad: 01/02/2025", rightColumnX + 50, rightColumnY + 10);

        doc.line(75, 30, 195, 30); // Línea horizontal

        // Datos del cliente
        doc.setFontSize(fontSizeTitle);
        doc.text("Datos del Cliente", rightColumnX, rightColumnY + 22.5);
        doc.setFontSize(fontSizeSubtitle);
        doc.text("Nombre: Juan Pérez", rightColumnX, rightColumnY + 30);
        doc.text("NIF/CIF: A1234567", rightColumnX, rightColumnY + 35,);
        doc.text("Teléfono: 987654321", rightColumnX, rightColumnY + 40);
        doc.text("Correo: info@empresa.com", rightColumnX, rightColumnY + 45);
        doc.text("Dirección: Calle Ficticia, 456", rightColumnX, rightColumnY + 50);

        // Línea de separación
        doc.line(15, 70, 195, 70); // Línea horizontal

        // Datos de los conceptos
        doc.setFontSize(fontSizeTitle);
        doc.text("Conceptos", startConceptX, startConceptY - 10);

        // Cabecera de la tabla de conceptos
        doc.setFontSize(fontSizeSubtitle);
        doc.text("Concepto", startConceptX, startConceptY);
        doc.text("Descripción", startConceptX + 30, startConceptY);
        doc.text("Cant.", startConceptX + 100, startConceptY);
        doc.text("Dto.", startConceptX + 115, startConceptY);
        doc.text("P/U", startConceptX + 130, startConceptY);
        doc.text("Imp.", startConceptX + 145, startConceptY);
        doc.text("SubTotal", startConceptX + 160, startConceptY);


        //doc.text("Impuestos", startConceptX + 80, startConceptY);

        // Llenar con conceptos (ejemplo)
        const concepts = [
            { concept: "Servicio A", description: "Descripción del servicio ", quantity: 1, discount: 1, unitPrice: 1, tax: 10, subtotal: 1 },
            { concept: "Alicatado Peredes", description: "Descripción del servicio B", quantity: 10, discount: 10, unitPrice: 10, tax: 21, subtotal: 100 },
            { concept: "Servicio C", description: "Descripción del servicio C  arroz Descripción del servicio C", quantity: 100, discount: 100, unitPrice: 100, tax: 10, subtotal: 1000 },
            { concept: "Servicio D", description: "M2 de alicatado de pasillo pequeño", quantity: 1000, discount: 1000, unitPrice: 1000, tax: 21, subtotal: 1000 },
            { concept: "Servicio E", description: "Descripción del servicio E", quantity: 10000, discount: 10000, unitPrice: 10000, tax: 10, subtotal: 10000 },
            //{ concept: "Alicatado Peredes Peredes", description: "Descripción del servicio F", quantity: 1, discount: 1, unitPrice: 1, tax: 10, subtotal: 1 },
            { concept: "Servicio G", description: "Descripción del servicio G", quantity: 10, discount: 10, unitPrice: 10, tax: 21, subtotal: 100 },
            { concept: "Servicio H", description: "Descripción del servicio H", quantity: 100, discount: 100, unitPrice: 100, tax: 10, subtotal: 1000 },
            { concept: "Servicio I", description: "Descripción del servicio I", quantity: 1000, discount: 1000, unitPrice: 1000, tax: 21, subtotal: 1000 },
            { concept: "Servicio J", description: "Descripción del servicio J", quantity: 10000, discount: 10000, unitPrice: 10000, tax: 10, subtotal: 10000 },

        ];

        let yPosition = startConceptY + 7.5; // Posición de inicio para los conceptos
        concepts.forEach((concept, index) => {

            const splittedConcept = concept.concept.length > 15 ? doc.splitTextToSize(concept.concept, 30) : [concept.concept];
            const splittedDescription = concept.description.length > 35 ? doc.splitTextToSize(concept.description, 70) : [concept.description];
            const maxLines = Math.max(splittedConcept.length, splittedDescription.length);

            doc.text(splittedConcept, startConceptX, yPosition);
            doc.text(splittedDescription, startConceptX + 30, yPosition);
            doc.text(concept.quantity.toString(), startConceptX + 100, yPosition);
            doc.text(concept.discount.toString(), startConceptX + 115, yPosition);
            doc.text(concept.unitPrice.toString(), startConceptX + 130, yPosition);
            doc.text(`${concept.tax}%`, startConceptX + 145, yPosition);
            doc.text(concept.subtotal.toString(), startConceptX + 160, yPosition);

            yPosition += maxLines * 7.5;
        });

        yPosition += 3.5;
        // Línea de separación
        doc.line(15, yPosition, 195, yPosition); // Línea horizontal
        yPosition += 5;

        // Totales
        doc.setFontSize(fontSizeSubtitle);
        doc.text("Totales", startSummaryX, yPosition);
        doc.setFontSize(fontSizeText);
        doc.text("Base Imponible:", startSummaryX + 130, yPosition);
        doc.text("200 €", startSummaryX + 160, yPosition); // Base imponible
        yPosition += 5;

        doc.text("IVA:", startSummaryX + 130, yPosition);
        doc.text("IVA incluido", startSummaryX + 160, yPosition); // IVA 
        yPosition += 7.5

        doc.setFontSize(fontSizeTitle);
        doc.text("Total:", startSummaryX + 130, yPosition);
        doc.text("230 €", startSummaryX + 160, yPosition); // Total
        yPosition += 5;
        doc.line(15, yPosition, 195, yPosition); // Línea horizon tal
        yPosition += 5;
        doc.setFontSize(fontSizeSubtitle);
        doc.text("Condiciones de pago: ", startSummaryX, yPosition);
        doc.setFontSize(fontSizeText);
        doc.text("Condiciones aquí ", startSummaryX + 45, yPosition);

        yPosition += 5;
        doc.line(15, yPosition, 195, yPosition); // Línea horizon tal
        yPosition += 5;
        doc.setFontSize(fontSizeSubtitle);
        doc.text("Firma de la empresa: ", startSummaryX + 35, yPosition + 35, { align: "center" });

        //doc.line(1, yPosition, 209, yPosition); // Línea horizon tal

        doc.line(100, yPosition, 100, yPosition + 35); // Línea vertical
        doc.text("Firma del cliente : ", startSummaryX + 135, yPosition + 35, { align: "center" });



        // Guardar el PDF
        doc.save(`Presupuesto_${12345}.pdf`);

        doc.save("factura.pdf");

        console.log("Docuemnto PDF hecho");

    }
    const DATA = [
        {
            "company": {
                "title": "ObraSmart S.L.",
                "nif": "B12345678",
                "address": "Calle Empresa 123, Ciudad",
                "phone_number": "912345678",
                "email": "info@obrasmart.es"
            },
            "budget": {
                "budget_number": "PRES-2025-001",
                "due_date": "2025-05-01",
                "issue_date": "2025-06-01"
            },
            "client": {
                "name": "Juan Pérez",
                "client_id_document": "12345678A",
                "phone": "678123456",
                "email": "juan.perez@email.com",
                "address": "Calle Cliente 456, Ciudad"
            },
            "concepts": [
                {
                    "concept": "Servicio A",
                    "description": "Descripción del servicio",
                    "quantity": 1,
                    "discount": 1,
                    "unitPrice": 1,
                    "tax": 10,
                    "subtotal": 1
                },
                {
                    "concept": "Alicatado Peredes",
                    "description": "Descripción del servicio B",
                    "quantity": 10,
                    "discount": 10,
                    "unitPrice": 10,
                    "tax": 21,
                    "subtotal": 100
                },
                {
                    "concept": "Servicio C",
                    "description": "Descripción del servicio C  arroz Descripción del servicio C",
                    "quantity": 100,
                    "discount": 100,
                    "unitPrice": 100,
                    "tax": 10,
                    "subtotal": 1000
                },
                {
                    "concept": "Servicio D",
                    "description": "M2 de alicatado de pasillo pequeño",
                    "quantity": 1000,
                    "discount": 1000,
                    "unitPrice": 1000,
                    "tax": 21,
                    "subtotal": 1000
                },
                {
                    "concept": "Servicio E",
                    "description": "Descripción del servicio E",
                    "quantity": 10000,
                    "discount": 10000,
                    "unitPrice": 10000,
                    "tax": 10,
                    "subtotal": 10000
                },
                {
                    "concept": "Servicio G",
                    "description": "Descripción del servicio G",
                    "quantity": 10,
                    "discount": 10,
                    "unitPrice": 10,
                    "tax": 21,
                    "subtotal": 100
                },
                {
                    "concept": "Servicio H",
                    "description": "Descripción del servicio H",
                    "quantity": 100,
                    "discount": 100,
                    "unitPrice": 100,
                    "tax": 10,
                    "subtotal": 1000
                },
                {
                    "concept": "Servicio I",
                    "description": "Descripción del servicio I",
                    "quantity": 1000,
                    "discount": 1000,
                    "unitPrice": 1000,
                    "tax": 21,
                    "subtotal": 1000
                },
                {
                    "concept": "Servicio J",
                    "description": "Descripción del servicio J",
                    "quantity": 10000,
                    "discount": 10000,
                    "unitPrice": 10000,
                    "tax": 10,
                    "subtotal": 10000
                }
            ],
            "conditions": "Condiciones aquí"
        }
    ]


    function generatePDF(data) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const company = data.company;
        const budget = data.budget;
        const client = data.client;
        const concepts = data.concepts;
        const conditions = data.conditions;

        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const pageBottomLimit = pageHeight - 30;

        const fontSizeTitle = 14;
        const fontSizeSubtitle = 12;
        const fontSizeText = 10;

        const startX = 15;
        let y = 20;

        function totalBudget() {
            return concepts.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2);
        }

        function drawHeader() {
            doc.setFontSize(fontSizeTitle);
            doc.text(company.title, startX, y);
            doc.setFontSize(fontSizeText);
            doc.text(`NIF: ${company.nif}`, startX, y += 5);
            doc.text(`Dirección: ${company.address}`, startX, y += 5);
            doc.text(`Teléfono: ${company.phone_number}`, startX, y += 5);
            doc.text(`Correo: ${company.email}`, startX, y += 5);

            y = 20;
            doc.setFontSize(fontSizeTitle);
            doc.text(`Presupuesto: ${budget.budget_number}`, pageWidth / 2, y);
            doc.setFontSize(fontSizeText);
            doc.text(`Emisión: ${budget.issue_date}`, pageWidth / 2, y += 5);
            doc.text(`Caducidad: ${budget.due_date}`, pageWidth / 2, y += 5);

            doc.line(75, 30, 195, 30); // Línea horizontal


            y += 10;
            doc.setFontSize(fontSizeSubtitle);
            doc.text(`Cliente: ${client.name}`, startX, y);
            doc.setFontSize(fontSizeText);
            doc.text(`NIF/CIF: ${client.client_id_document}`, startX, y += 5);
            doc.text(`Teléfono: ${client.phone}`, startX, y += 5);
            doc.text(`Correo: ${client.email}`, startX, y += 5);
            doc.text(`Dirección: ${client.address}`, startX, y += 5);

            y += 10;
        }

        function drawConceptsHeader() {
            doc.setFontSize(fontSizeSubtitle);
            doc.text("Concepto", startX, y);
            doc.text("Descripción", startX + 30, y);
            doc.text("Cant.", startX + 100, y);
            doc.text("Dto.", startX + 115, y);
            doc.text("P/U", startX + 130, y);
            doc.text("Imp.", startX + 145, y);
            doc.text("Subtotal", startX + 160, y);
            y += 7;
        }

        function drawConcepts() {
            drawConceptsHeader();

            concepts.forEach((concept) => {
                const splittedConcept = doc.splitTextToSize(concept.concept, 30);
                const splittedDesc = doc.splitTextToSize(concept.description, 70);
                const lines = Math.max(splittedConcept.length, splittedDesc.length);
                const blockHeight = lines * 7;

                if (y + blockHeight > pageBottomLimit) {
                    doc.addPage();
                    y = 20;
                    drawConceptsHeader();
                }

                doc.setFontSize(fontSizeText);
                doc.text(splittedConcept, startX, y);
                doc.text(splittedDesc, startX + 30, y);
                doc.text(String(concept.quantity), startX + 100, y);
                doc.text(String(concept.discount), startX + 115, y);
                doc.text(String(concept.unitPrice), startX + 130, y);
                doc.text(`${concept.tax}%`, startX + 145, y);
                doc.text(String(concept.subtotal), startX + 160, y);

                y += blockHeight;
            });
        }

        function drawSummary() {
            if (y + 30 > pageBottomLimit) {
                doc.addPage();
                y = 20;
            }

            y += 5;
            doc.setFontSize(fontSizeSubtitle);
            doc.text("Resumen", startX, y);

            y += 5;
            doc.setFontSize(fontSizeText);
            doc.text("Base Imponible:", startX + 130, y);
            doc.text(`${totalBudget()} €`, startX + 160, y);
            y += 5;

            doc.text("IVA:", startX + 130, y);
            doc.text("Incluido", startX + 160, y);
            y += 7;

            doc.setFontSize(fontSizeTitle);
            doc.text("TOTAL:", startX + 130, y);
            doc.text(`${totalBudget()} €`, startX + 160, y);

            y += 10;
            doc.setFontSize(fontSizeSubtitle);
            doc.text("Condiciones de pago:", startX, y);
            doc.setFontSize(fontSizeText);
            doc.text(conditions, startX + 50, y);
        }

        // Comienza el renderizado
        drawHeader();
        drawConcepts();
        drawSummary();

        doc.save(`Presupuesto_${budget.budget_number}.pdf`);
    }




    return {
        badForm: false,

        oncreate: ({ attrs }) => {
            const { budget_number } = attrs;

            fetchData(URLS.Clients, data => {
                state.clients = data.map(c => ({
                    id: c.client_id,
                    value: c.client_id,
                    label: `${c.name} ${c.surname} - ${c.client_id_document}`
                }));
                console.log("Clientes: ", state.clients);

                m.redraw();
            });

            fetchData(URLS.Projects, data => {
                state.projects = data.map(p => ({
                    id: p.project_id,
                    value: p.project_id,
                    label: `${p.name} - ${p.status}`
                }));
                console.log("Proyectos: ", state.projects);
                m.redraw();
            });

            if (budget_number) {
                fetchData(URLS.Budgets).then(budgets => {
                    state.selectedBudget = budgets.find(b => b.budget_number == budget_number);
                    //console.log("Contenido de state.selectedBudget", state.selectedBudget);
                    state.headerDocument = [
                        createHeaderDocument({
                            inputClient: state.selectedBudget.client_id,
                            inputProject: state.selectedBudget.project_id,
                            inputStatus: state.selectedBudget.status,
                            inputCreation: today,
                            inputExpiration: today,
                        })]
                    console.log("Contenido de state.headerDocument", state.headerDocument);

                    return fetchData(URLS.BudgetDetails);
                }).then(details => {
                    console.log("Details:", details);
                    console.log("Id selected: ", state.selectedBudget);

                    state.budgetDetails = details.filter(d => d.budget_id === state.selectedBudget.budget_id);
                    //console.log("Contenido de state.budgetDetails", state.budgetDetails);
                    state.conceptItemsUpdate = state.budgetDetails.map((item) =>
                        createConcept({
                            budget_concept_id: item.budget_concept_id,
                            concept: item.concept,
                            quantity: item.quantity,
                            unit_price: item.unit_price,
                            description: item.description,
                            tax: item.tax,
                            discount: item.discount,
                            subtotal: item.subtotal
                        })
                    )
                    console.log("Contenido de state.conceptItemsUpdate", state.conceptItemsUpdate);
                    m.redraw();
                });
            }
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

            const renderSelect = (label, options, id, bclass = "col-md-4", type = 1) =>
                m("div", { class: bclass }, [
                    m("label.form-label", label),
                    m("select.form-select", {
                        id: id,
                        value: state.headerDocument[0]?.[id],
                        onchange: e => { state.headerDocument[0][id] = e.target.value; m.redraw(); },
                    },
                        m("option", { value: "", disabled: true, selected: !state.headerDocument[0]?.[id] }, "-- Selecciona --"),
                        ...options.map(opt => m("option", { value: opt.value }, opt.label || opt.content))
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
                    m("div.col-md-2"),
                    // Select de impuestos
                    m("div.col-md-2.mt-2", [
                        m("label.form-label", "Impuestos"),
                        m("select.form-select", {
                            id: `tax-${index}`,
                            value: Number(item.tax ?? 0),
                            onchange: e => { item.tax = parseFloat(e.target.value); updateConceptSubtotal(item); },
                        },
                            taxes.map(opt => m("option", { value: opt.value }, opt.label || opt.content))
                        )
                    ]),
                    // Suub Total
                    m("div.col-md-2.mt-2", [
                        m("label.form-label", "SubTotal"),
                        m("input.form-control[readonly]", { id: `subtotal-${index}`, value: `${Number(item.subtotal ?? 0).toFixed(2)} €` })
                    ])
                ])

            // Btns Eliminar y Añadir concepto
            const btnsAction = () =>
                m("div.col-12.mt-3.d-flex.justify-content-center", [
                    m("div.col-md-6.d-flex.flex-column.flex-md-row.justify-content-between", [
                        m(ButtonComponent, {
                            text: "Eliminar concepto",
                            bclass: "btn btn-danger ",
                            actions: () => typeForm == "update" ? state.conceptItemsUpdate.pop() : state.conceptItems.pop(),
                        }, m("i.fa.fa-trash-can.me-2.ms-2", { style: { color: "white" } })),
                        m(ButtonComponent, {
                            text: "Añadir concepto",
                            bclass: "btn-warning ",
                            actions: () => typeForm == "update" ? state.conceptItemsUpdate.push(createConcept()) : state.conceptItems.push(createConcept()),
                        }, m("i.fa.fa-plus.me-2.ms-2")),
                        m(ButtonComponent, {
                            text: "Descargar PDF ",
                            bclass: "btn-outline-danger",
                            actions: () => generatePDF(DATA[0])
                        }, m("i.fa-solid.fa-file-pdf", { style: { color: "red" } })
                        )
                    ])
                ])

            // Btns volver y aceptar
            const btnsFoot = () =>
                m("div.col-12.d-flex.justify-content-center", [
                    m("div.col-md-6.d-flex.flex-column.flex-md-row.justify-content-between", [
                        m(ButtonComponent, {
                            iconFirst: true,
                            text: "Volver",
                            bclass: "btn-warning ",
                            actions: () => new bootstrap.Modal(document.getElementById("ModalCancelationBudget")).show()
                            ,
                        }, m("i.fa.fa-arrow-left.me-2.ms-2")),
                        m(ButtonComponent, {
                            text: "Aceptar",
                            type: "submit",
                            class: "btn-success ",
                        }, m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })),
                    ])
                ])


            //Formulario completo y renderizado
            return m("div.col-11.col-md-10", { style: style.containerStyle }, [
                m("form.row.col-12", { onsubmit: handleFormSubmit }, [
                    m("hr"),
                    m("span.fw-bold.text-uppercase.fs-5", "Cabecera del documento"),
                    m("div.row.col-12.p-0.m-0", [
                        renderInputGroup("Filtrar clientes", "filterClients"),
                        renderInputGroup("Filtrar proyectos", "filterProjects"),
                        renderSelect("Estado", statusOptions, "inputStatus"),
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
                    btnsFoot()
                ])
            ])
        }
    }
}

export { BudgetsPage }