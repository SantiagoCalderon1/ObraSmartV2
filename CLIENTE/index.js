// IMPORTADOR DE CONSTANTES
import { URL_LOGOUT, URL_AUTH } from "./Util/constantes.js"

// IMPORTADOR DE FUNCIONES
import { request } from "./Util/util.js";

// IMPORTADOR DE PÁGINAS
import { HeaderComponent } from "./Pages/generalsComponents.js"
import { HomePage } from "./Pages/home.js"
import { LoginPage } from "./Pages/login.js"
import { BudgetsPage } from "./Pages/budgets.js";

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
            if (this.loading) {
                return m("div", "Cargando...") // Mostrar algo mientras estamos verificando la autenticación
            }

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
    '/budgets': { view: () => m(authGuard, m(BudgetsPage, { option: "list" })) },
    '/budget/:option/:id': { view: ({ attrs }) => m(authGuard, m(BudgetsPage, { option: attrs.option, id: attrs.id })) },

}

// Montamos en app y actualizamos el layout
m.route(document.getElementById("app"), "/login", routes);



