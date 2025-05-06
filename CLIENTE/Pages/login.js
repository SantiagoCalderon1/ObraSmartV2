import { ButtonComponent } from "../Util/generalsComponents.js";
import { loginUser } from "../Services/auth.js";


export function LoginPage() {
    return {
        oncreate: () => { window.scrollTo(0, 0); },
        view: function () {
            return m("div", { class: "w-100 vh-100 d-flex align-items-center justify-content-center" }, m(FormComponent));
        }
    }
}

function FormComponent() {
    let showPassword = false, badCredentials = false
    return {
        login: async function (e) {
            e.preventDefault();
            let loginData = {
                email: e.target.email.value,
                password: e.target.password.value,
                remember: document.getElementById("rememberMe").checked
            };
            //console.log("Enviando datos: ", JSON.stringify(loginData));
            try {
                const data = await loginUser(loginData);
                if (data.status === 200 && data.response.token) {
                    badCredentials = false;
                    // Guardar el token según la preferencia del usuario
                    const storage = loginData.remember ? localStorage : sessionStorage;
                    storage.setItem("token", data.response.token);
                    m.route.set("/home");
                } else {
                    badCredentials = true;
                    localStorage.clear();
                    sessionStorage.clear();
                }
            } catch (error) {
                console.error("Error en login:", error);
                badCredentials = true;
            }
            m.redraw();
        },
        view: function () {
            return m("div.container-fluid", { class: "min-vh-100 d-flex flex-row p-0" }, [
                // Columna izquierda (Formulario)
                m("div", { class: "col-md-7 d-flex flex-column justify-content-center align-items-center p-5 gap-5" }, [
                    // Logo y título
                    m("div.text-center", { style: {} }, [
                        m("img", { src: "./assets/logosObraSmart/logo-2.png", style: { width: "150px", height: "150px" } }),
                        m("h1", { class: " mt-3 text-nowrap" }, "¡Bienvenido de nuevo!"),
                    ]),
                    m("div", { class: "w-100", style: { maxWidth: "400px" } }, [
                        m("form.row.g-3", { onsubmit: (e) => this.login(e) }, [
                            // Email
                            m("div.col-12", [
                                m("input", {
                                    type: "email",
                                    name: "email",
                                    class: `form-control px-3 py-2 rounded-pill ${badCredentials ? "is-invalid" : ""}`,
                                    style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
                                    placeholder: "Correo electrónico",
                                    autocomplete: "email"
                                })
                            ]),
                            // Contraseña
                            m("div.col-12", [
                                m("div.input-group", [
                                    m("input", {
                                        type: showPassword ? "text" : "password",
                                        name: "password",
                                        class: `form-control px-3 py-2 me-2 rounded-pill ${badCredentials ? "is-invalid" : ""}`,
                                        style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
                                        placeholder: "Contraseña",
                                        autocomplete: "current-password"
                                    }),
                                    m(ButtonComponent,
                                        {
                                            bclass: "btn btn-outline-secondary rounded-pill fw-normal",
                                            type: "button",
                                            style: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
                                            actions: () => {
                                                showPassword = !showPassword;
                                                m.redraw();
                                            }
                                        },
                                        m("i", { class: `fa-solid ${showPassword ? "fa-eye" : "fa-eye-slash"}` })
                                    )
                                ])
                            ]),
                            // Mensaje de error
                            badCredentials ?
                                m("p.text-center", { style: { color: "red", fontSize: "14px" } }, "Usuario o contraseña incorrectos")
                                : null,
                            // Recuérdame
                            m("div.col-6", { class: "my-3 mx-2" }, [
                                m("input", { type: "checkbox", id: "rememberMe", }),
                                m("label", { for: "rememberMe", class: "ms-3" }, "Recuerdame")
                            ]),
                            // Botón de iniciar sesión
                            m(ButtonComponent,
                                {
                                    type: "submit",
                                    bclass: "btn-primary w-100 py-2 rounded-pill fw-semibold", style: { backgroundColor: "var(--mainPurple)" }
                                },
                                ["Iniciar Sesión"]
                            ),
                        ]),
                        // Separador
                        m("hr.my-5"),
                        // Registro y recuperación
                        m("div.text-center", [
                            m(m.route.Link, { class: "small", href: "/forgot-password" }, "¿Olvidaste tu contraseña?"),
                            m("p.py-3", "¿No tienes una cuenta?"),
                        ]),
                        m(ButtonComponent,
                            {
                                bclass: "btn btn-warning w-100 py-2 rounded-pill fw-normal",
                                type: "submit",
                                actions: () => m.route.set("/register")
                            },
                            ["Crear una cuenta"]
                        ),
                    ]),
                ]),
                // Columna derecha (imagen de fondo solo en desktop)
                m("div.d-none.d-md-block", {
                    class: "col-md-5 p-0",
                    style: {
                        backgroundImage: "url('./assets/background-login.webp')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat"
                    }
                })
            ])
        }
    };
}

