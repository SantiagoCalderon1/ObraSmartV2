import { ClientsListPage } from "./clients-list.js";
//import { ClientFormPage } from "./client-form.js";


export function ClientsPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(ClientsListPage);
                    break;
                /*    case "create":
                       content = m(ClientFormPage, { type: "create" });
                       break;
                   case "update":
                       content = m(ClientFormPage, { type: "update", estimate_number: attrs.id });
                       break; */
                default:
                    content = m("div", "Vista no encontrada");
            }
            return m("div", { style: { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "var(--secondaryWhite)", paddingBottom: '50px' } }, [
                content
            ]);
        }
    }
}

