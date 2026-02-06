// IMPORTADOR DE CONSTANTES
import { URL_LOGOUT, URL_AUTH } from "./Util/constantes.js"
import { authState } from "./lib/auth.js";


// IMPORTADOR DE FUNCIONES
import { request } from "./Util/util.js";

// IMPORTADOR DE PÁGINAS
import { Header } from "./components/header.js"
import { HomePage } from "./pages/home.js"
import { LoginPage } from "./pages/login.js"
import { EstimatesPage } from "./pages/estimates/estimates.js";
import { InvoicesPage } from "./pages/invoices/invoices.js";
import { ClientsPage } from "./pages/clients/clients.js";
import { ProjectsPage } from "./pages/projects/projects.js";
import { MaterialsPage } from "./pages/materials/materials.js";
import { MyAccountPage } from "./pages/myAccount/myAccount.js";
import { GeneratePDF } from "./components/generate-pdf.js";


//import { RegisterPage } from "./pages/register.js" 


async function Logout() {
    try {
        await request("POST", URL_LOGOUT)
    } catch (error) {
        //console.error("Error cerrando sesión: ", error)
    } finally {
        localStorage.clear()
        sessionStorage.clear()
        m.route.set("/login")
    }
}

// Función para proteger rutas con Bearer Token
function authGuard() {
    return {
        oninit: async function () {
            if (!authState.checked) {
                try {
                    const data = await request("GET", URL_AUTH);
                    if (data) {
                        authState.authenticated = true;
                    }
                } catch (_) {
                    authState.authenticated = false;
                } finally {
                    authState.checked = true;
                    m.redraw();
                }
            }
        },
        view: function ({ children }) {
            if (!authState.checked || false) {
                return m("div.d-flex.justify-content-center.align-items-center", {
                    style: { height: "100vh" }
                }, m("div.spinner-border", { role: "status" }));
            }

            if (!authState.authenticated || false) {
                return m(LoginPage);
            }

            return m("div", {
                id: "container-app",
                style: {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    width: "100%",
                    height: "100%"
                }
            }, [
                m(Header),
                m("main", { id: "app", style: { paddingTop: "7.5vh" } }, children),
                m("div", { id: "hidden-pdf" })
            ]);
        }
    }
}



// Definimos las rutas
const routes = {
    //'/': { view: () => m(LoginPage) },
    '/': { view: () => m(HomePage) },
    //'/login': { view: () => m(LoginPage) },
    //'/register': { view: () => m(RegisterPage) },

    // Rutas protegidas  
    '/logout': { view: () => { Logout(); m(LoginPage) } },
    '/home': { view: () => m(authGuard, m(HomePage)) },

    // Routes Estimates
    '/estimates': { view: () => m(authGuard, m(EstimatesPage, { option: "show" })) },
    '/estimates/create': { view: () => m(authGuard, m(EstimatesPage, { option: "create" })) },
    '/estimates/update/:id': { view: ({ attrs }) => m(authGuard, m(EstimatesPage, { option: "update", id: attrs.id })) },

    // Routes Invoices
    '/invoices': { view: () => m(authGuard, m(InvoicesPage, { option: "show" })) },
    '/invoices/create/:id': { view: ({ attrs }) => m(authGuard, m(InvoicesPage, { option: "create", id: attrs.id })) },

    // Routes Clients
    '/clients': { view: () => m(authGuard, m(ClientsPage, { option: "show" })) },

    // Routes Projects
    '/projects': { view: () => m(authGuard, m(ProjectsPage, { option: "show" })) },
    '/projects/:id': { view: ({ attrs }) => m(authGuard, m(ProjectsPage, { option: "show-info", id: attrs.id })) },

    // Routes Materials
    '/materials': { view: () => m(authGuard, m(MaterialsPage, { option: "show" })) },

    // Routes MyAccount
    '/my-account': { view: () => m(authGuard, m(MyAccountPage, { option: "show" })) },

}

// Montamos en app y actualizamos el layout
m.route(document.body, "/", routes);
