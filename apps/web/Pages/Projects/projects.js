import { ProjectsListPage } from "./projects-list.js";
//import { ProjectFormPage } from "./client-form.js";


export function ProjectsPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(ProjectsListPage);
                    break;
                /*   case "create":
                      content = m(ProjectFormPage, { type: "create" });
                      break;
                  case "update":
                      content = m(ProjectFormPage, { type: "update", estimate_number: attrs.id });
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

