// IMPORTADOR DE CONSTANTES
import { URL_LOGOUT, URL_AUTH } from "./Util/constantes.js"

// IMPORTADOR DE FUNCIONES
import { request } from "./Util/util.js";

// IMPORTADOR DE PÁGINAS
import { HeaderComponent } from "./Util/generalsComponents.js"
import { HomePage } from "./Pages/home.js"
import { LoginPage } from "./Pages/login.js"
import { EstimatesPage } from "./Pages/Estimates/estimates.js";
import { InvoicesPage } from "./Pages/Invoices/invoices.js";
import { ClientsPage } from "./Pages/Clients/clients.js";
import { ProjectsPage } from "./Pages/Projects/projects.js";
import { MaterialsPage } from "./Pages/Materials/materials.js";
import { MyAccountPage } from "./Pages/MyAccount/myAccount.js";


/*
import { RegisterPage } from "./pages/register.js" 
import { ProfilePage } from "./pages/profile.js" 
import { AboutPage } from "./pages/about.js" 
import { ContactPage } from "./pages/contact.js" 
import { NotFoundPage } from "./pages/notfound.js" 
*/

async function Logout() {
    try {
        await request("POST", URL_LOGOUT)
    } catch (error) {
        console.error("Error cerrando sesión: ", error)
    } finally {
        localStorage.clear()
        sessionStorage.clear()
        m.route.set("/login")
    }
}

// Función para proteger rutas con Bearer Token
function authGuard() {
    return {
        isAuthenticated: false,
        loading: true,
        oninit: async function () {
            try {
                const data = await request("GET", URL_AUTH) // aquí ya manejamos token + redirección
                if (data) { this.isAuthenticated = true }
            } finally {
                this.loading = false
                m.redraw()
            }
        },
        view: function ({ children }) {
       
            return m("div", {
                id: "container-app",
                style: { display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "100%", height: "100%" }
            }, [
                this.isAuthenticated ? m("header", { id: "header" }, m(HeaderComponent)) : null,
                m("main", { id: "app", style: { paddingTop: this.isAuthenticated ? "7.5vh" : "" } }, children),
            ]);
        }
    }
}


// Definimos las rutas
const routes = {
    '/': { view: () => m(LoginPage) },
    '/login': { view: () => m(LoginPage) },
    //'/register': { view: () => m(RegisterPage) },

    // Rutas protegidas (Solo accesibles si se está autenticado)
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
    //'/clients/create/:id': { view: ({ attrs }) => m(authGuard, m(ClientsPage, { option: "create", id: attrs.id })) },

    // Routes Projects
    '/projects': { view: () => m(authGuard, m(ProjectsPage, { option: "show" })) },
    //'/clients/create/:id': { view: ({ attrs }) => m(authGuard, m(InvoicesPage, { option: "create", id: attrs.id })) },

     // Routes Materials
    '/materials': { view: () => m(authGuard, m(MaterialsPage, { option: "show" })) },
    //'/clients/create/:id': { view: ({ attrs }) => m(authGuard, m(InvoicesPage, { option: "create", id: attrs.id })) },

        // Routes MyAccount
    '/my-account': { view: () => m(authGuard, m(MyAccountPage, { option: "show" })) },
    //'/clients/create/:id': { view: ({ attrs }) => m(authGuard, m(InvoicesPage, { option: "create", id: attrs.id })) },


}

// Montamos en app y actualizamos el layout
m.route(document.getElementById("app"), "/login", routes);



