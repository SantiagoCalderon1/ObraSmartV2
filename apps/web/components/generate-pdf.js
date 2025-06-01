import { fetchCompany, fetchEstimate, fetchInvoice } from "../Services/services.js"
import { URL_IMAGE } from "../Util/constantes.js"
import { TableModal } from "./table-modal.js"
import { toBase64FromURL } from "../Util/util.js"


export function GeneratePDF() {
    let company = {}, invoice = {}, estimate = {}, client = {}, title = "", iva = 0
    return {
        oncreate: async function ({ attrs }) {
            company = (await fetchCompany(1)).data

            if (company?.image_route) {
                try {
                    company.image_base64 = await toBase64FromURL(`${URL_IMAGE}${company.image_route}`)
                } catch (err) {
                    //console.error("Error convirtiendo imagen a base64:", err)
                }
            }

            title = attrs.title
            if (attrs.invoice) {
                invoice = attrs.invoice
                estimate = invoice?.estimate
                iva = estimate?.iva || 21
                client = estimate?.client
            }

            if (attrs.estimate) {
                estimate = attrs.estimate
                iva = estimate?.iva || 21
                client = estimate?.client
            }


            console.log("Factura: ", invoice);
            console.log("Estimado: ", estimate);

            console.log("creando pdf");

            m.redraw()
            // Espera 10s a que se renderice el componente
            setTimeout(() => generatePDF(), 5000)
        },
        view: function () {
            const headerDocument = () => [
                m("div.row", [
                    m("div.mt-5.col-md-12.d-flex.justify-content-between.align-items-center", [
                        m("div.text-center", [
                            m("img", {
                                src: company.image_base64 || "/logosObraSmart/logo-1.png",
                                alt: "Logo",
                                style: "width: 100px; height: 100px;"
                            }),
                            m("p.mb-0.text-uppercase", company?.name || ""),
                        ]),
                        m("h1.text-uppercase", title),
                        m("div.text-end", [
                            m("p.mb-0", `NIF: ${company?.nif || ""}`),
                            m("p.mb-0", company?.phone || ""),
                            m("p.mb-0", company?.email || ""),
                            m("p.mb-0", company?.address || ""),
                        ]),
                    ]),
                ])
            ]

            const invoiceData = () => [
                m("div.text-start", [
                    m("p.mb-0", `Nº: ${invoice?.invoice_number || ""}`),
                    m("p.mb-0", `Fecha emisión: ${invoice?.issue_date || ""}`),
                    m("p.mb-0", `Válido hasta: ${invoice?.issue_date || ""}`),
                ]),
            ]

            const estimateData = () => [
                m("div.text-start", [
                    m("p.mb-0", `Nº: ${estimate?.estimate_number || ""}`),
                    m("p.mb-0", `Fecha emisión: ${estimate?.issue_date || ""}`),
                    m("p.mb-0", `Válido hasta: ${estimate?.issue_date || ""}`),
                ]),
            ]

            const clientData = () => [
                m("div.text-end", [
                    m("p.mb-0", client?.name),
                    m("p.mb-0", client?.nif),
                    m("p.mb-0", client?.phone),
                    m("p.mb-0", client?.email),
                    m("p.mb-0", client?.address),
                ]),
            ]

            const subHeaderDocument = () => [
                m("div.row.pt-5", [
                    m("div.card.col-md-12", [
                        m("div.card-header.bg-light.d-flex.justify-content-between",
                            [
                                m("strong", `Datos ${title}`),
                                client ? m("strong", "Datos del cliente") : null
                            ]
                        ),
                        m("div.card-body.d-flex.justify-content-between.py-2", [
                            title === "factura" && invoice ? invoiceData() : null,
                            title === "presupuesto" && estimate ? estimateData() : null,
                            client && clientData(),
                        ])
                    ]),
                ]),
            ]

            const footerDocument = () => [
                m("div.mt-5",
                    headerDocument(),
                ),
                //subHeaderDocument(),
                // Condiciones
                m("div.row.mt-5.py-2.mb-5", [
                    m("div.card", [
                        m("div.card-header.bg-light.fw-bold", "Condiciones"),
                        m("div.card-body", m("p.mb-0", estimate?.conditions))
                    ])
                ]),
                // Totales
                m("div.row.mt-2.py-2", [
                    m("div.card", [
                        m("div.text-end.p-3", [
                            m("p.mb-0.fw-bold", `SubTotal: €${(estimate?.total_cost / (1 + (iva || 0) / 100)).toFixed(2)}`),
                            m("p.mb-0.fw-bold", `IVA: ${iva}%`),
                            m("p.mb-0.fw-bold", `Total: €${estimate?.total_cost}`),
                        ])
                    ])
                ]),
                // Firmas
                m("div.py-5.d-flex.justify-content-between", { style: { marginTop: "200px" } }, [
                    m("p", "Firma cliente: ____________________"),
                    m("p", "Firma empresa: ___________________"),
                ])
            ]

            // -- Columnas
            const columnsMaterials = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "material.name" },
                { title: "Cantidad", field: "quantity" },
                { title: "P / U", field: "unit_price", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_price", euroSign: "€" },
            ]

            const columnsLabors = [
                { title: "#", field: "index" },
                { title: "Nombre", field: "labor_type.name" },
                { title: "Descripción", field: "description" },
                { title: "Horas", field: "hours" },
                { title: "P / H", field: "cost_per_hour", euroSign: "€" },
                { title: "Descuento", field: "discount", euroSign: "€" },
                { title: "P / Neto", field: "total_cost", euroSign: "€" },
            ]

            // -- Normalización
            const normalizedMaterials = (estimate?.materials || []).map((m, i) => ({
                ...m,
                index: i + 1,
                "material.name": m?.material?.name || "N/A",
                "quantity": (`${m.quantity} ${m.material?.unit}`) || "N/A",
                "unit_price": m.unit_price || "N/A",
                "discount": m.discount || "N/A",
                "total_price": m.total_price || "N/A",
            }))

            const normalizedLabors = (estimate?.labors || []).map((l, i) => ({
                ...l,
                index: i + 1,
                "labor_type.name": l.labor_type?.name || "N/A",
                "description": l.description || "N/A",
                "hours": l.hours || "N/A",
                "cost_per_hour": l.cost_per_hour || "N/A",
                "discount": l.discount || "N/A",
                "total_cost": l.total_cost || "N/A",
            }))

            // -- Paginado por tipo
            function splitInChunks(data, chunkSize = 20, checkMaterials = []) {
                const chunks = []
                if (checkMaterials.length === 0) {
                    // Primera página: solo 3 elementos
                    chunks.push(data.slice(0, 3))
                    // Páginas siguientes: usar chunkSize normal a partir del 4º
                    for (let i = 3; i < data.length; i += chunkSize) {
                        chunks.push(data.slice(i, i + chunkSize))
                    }
                } else {
                    //  normal
                    for (let i = 0; i < data.length; i += chunkSize) {
                        chunks.push(data.slice(i, i + chunkSize))
                    }
                }
                return chunks
            }

            const materialPages = splitInChunks(normalizedMaterials, 10, normalizedMaterials)
            const laborPages = splitInChunks(normalizedLabors, 5, normalizedMaterials)

            // -- Render por página
            const pages = []

            // Render materiales
            materialPages.forEach((chunk, i) => {
                pages.push(
                    m("div", {
                        class: "page-break",
                        style: { pageBreakAfter: "always" }
                    }, [
                        headerDocument(),
                        ...(i === 0 ? subHeaderDocument() : []),
                        m("h5.mt-3", "Materiales"),
                        m(TableModal, {
                            columns: columnsMaterials,
                            data: chunk,
                            maxHeight: false,
                            toPDF: true
                        }),
                    ])
                )
            })

            // Render mano de obra
            laborPages.forEach((chunk, i) => {
                pages.push(
                    m("div", {
                        class: "page-break mt-5",
                        style: { pageBreakAfter: "always" }
                    }, [
                        headerDocument(),
                        ...(materialPages.length === 0 && i === 0 ? subHeaderDocument() : []),
                        m("h5.mt-3", "Mano de Obra"),
                        m(TableModal, {
                            columns: columnsLabors,
                            data: chunk,
                            maxHeight: false,
                            toPDF: true
                        }),
                    ])
                )
            })

            pages.push(footerDocument())

            return m("div", {
                id: "pdf-content-wrapper",
                style: {
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "210mm", // A4 width
                    padding: "0",
                    margin: "0",
                    background: "white",
                    zIndex: -1,
                    opacity: 0,
                    pointerEvents: "none",
                }
            }, [
                //m("button.btn.btn-primary.p-3.my-3", { onclick: generatePDF }, "Descargar PDF"),
                m("div.container.col-11", { id: "pdf-content" }, pages)
            ])
        }
    }

    function generatePDF() {
        const element = document.getElementById("pdf-content")

        const now = new Date()
        const pad = n => n.toString().padStart(2, '0')
        const timestamp = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}-${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`

        html2pdf().set({
            margin: 1,
            filename: `${title}-${timestamp}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        }).from(element).save().then(() => {
            // Elimina el contenedor del DOM después de guardar
            console.log("eliminado elemento");

            element?.remove()
        })
    }
}  