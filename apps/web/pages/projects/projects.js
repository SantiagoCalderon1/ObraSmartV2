import { ProjectsListPage } from "./projects-list.js";
import { ProjectInfoPage } from "./project-info.js";
export function ProjectsPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(ProjectsListPage);
                    break;
                case "show-info":
                    content = m(ProjectInfoPage, { id: attrs.id });
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

