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
                    content = m(InvoicesFormPage, { estimate_number: attrs.id });
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

