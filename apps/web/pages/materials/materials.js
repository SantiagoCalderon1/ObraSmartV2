import { MaterialsListPage } from "./materials-list.js"; 
export function MaterialsPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(MaterialsListPage);
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

