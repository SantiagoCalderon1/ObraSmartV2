import { MaterialsListPage } from "./Materials-list.js";
//import { MaterialFormPage } from "./Material-form.js";


export function MaterialsPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(MaterialsListPage);
                    break;
                /*    case "create":
                       content = m(MaterialFormPage, { type: "create" });
                       break;
                   case "update":
                       content = m(MaterialFormPage, { type: "update", material_id: attrs.id });
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

