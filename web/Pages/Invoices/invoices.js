import { InvoicesListPage } from "./invoices-list.js";
import { InvoicesFormPage } from "./invoices-form.js";


export function InvoicesPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(InvoicesListPage);
                    break;
                case "create":
                    content = m(InvoicesFormPage, {  estimate_number: attrs.id });
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

