import { EstimatesListPage } from "./estimates-list.js";
import { EstimateFormPage } from "./estimates-form.js";
export function EstimatesPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(EstimatesListPage);
                    break;
                case "create":
                    content = m(EstimateFormPage, { type: "create" });
                    break;
                case "update":
                    content = m(EstimateFormPage, { type: "update", estimate_number: attrs.id });
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