import { Modal, ModalConfirmation } from "../../Util/generalsComponents.js";

// IMPORTADOR DE FUNCIONES
import { fetchCompany, fetchUser, updateUser, updateCompany } from "../../Services/services.js";

import { Button } from "../../components/button.js";

export function MyAccountPage() {
    return {
        view: function ({ attrs }) {
            let content;
            switch (attrs.option) {
                case "show":
                    content = m(Profile);
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

function Profile() {
    let style = {
        _input_main: { backgroundColor: "var(--mainGray)", border: "1px solid var(--mainPurple)" },
        _input_secondary: { backgroundColor: "var(--mainGray)", border: "1px solid var(--secondaryPurple)" },
    }

    let user = {}, company = {} 



    async function loadData() {
        user = (await fetchUser()).user;
        company = (await fetchCompany(1)).data;
        console.log(user);
        console.log(company);
 
        m.redraw();
    }

    return {
        oncreate: loadData,
        view: function () {
            const handleFormSubmit = async (e) => {
                e.preventDefault();
                const dataToSend = user;
                //console.log("dataToSend: ", dataToSend);
                try {
                    let response;
                    response = await updateUser(dataToSend);

                    //console.log("Response form: ", response);
                    Toastify({
                        text: "¡Operación exitosa!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();
                } catch (error) {
                    //console.error("Error al enviar el formulario:", error);
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();
                } finally {
                    m.redraw();
                }
            };

            // Función de actualización de la compañía
            const handleCompanyFormSubmit = async (e) => {
                e.preventDefault();
                const dataToSend = company
                console.log("dataToSend: ", dataToSend);
                try {
                    let response = await updateCompany(dataToSend);
                    console.log("Response form: ", response);


                    //console.log("Response form: ", response);
                    Toastify({
                        text: "¡Operación exitosa!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();
                    attrs.onClientSaved?.();
                } catch (error) {
                    //console.error("Error al enviar el formulario:", error);
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();
                } finally {
                    m.redraw();
                }
            };

            const handleFormResetPassword = async (e) => {
                e.preventDefault();

                const dataToSend = {
                    old_password: user.oldPassword,
                    new_password: user.newPassword,
                    new_password_confirmation: user.passwordConfirmation
                };

                try {
                    let response = await updatePassword(dataToSend); // Llamada para actualizar la contraseña
                    //console.log("Response form: ", response);

                    Toastify({
                        text: "¡Contraseña actualizada exitosamente!",
                        className: "toastify-success",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();

                    attrs.onClientSaved?.(); // Llama al callback si existe
                } catch (error) {
                    //console.error("Error al enviar el formulario de cambio de contraseña:", error);
                    Toastify({
                        text: "¡Algo salió mal!",
                        className: "toastify-error",
                        duration: 3000,
                        close: true,
                        gravity: "top",
                        position: "right"
                    }).showToast();
                } finally {
                    m.redraw();
                }
            };

            const handleLogoSubmit = async (e) => {
                e.preventDefault();
                if (!company.logo_img) {
                    return Toastify({
                        text: "Debes seleccionar una imagen.",
                        className: "toastify-error",
                        duration: 3000,
                    }).showToast();
                }
                const formData = new FormData();
                formData.append("image_route", company.logo_img); // <-- Archivo real
                console.log("Company logo ", company.logo_img);
                try {
                    const response = await updateCompany(formData, company.company_id); // <-- Asegúrate de pasar el ID
                    console.log("Response form img: ", response);
                    Toastify({
                        text: "¡Logo actualizado!",
                        className: "toastify-success",
                        duration: 3000,
                    }).showToast();
                } catch (err) {
                    console.error("Error al enviar el formulario de cambio de logo:", err);
                    Toastify({
                        text: "Error al subir logo.",
                        className: "toastify-error",
                        duration: 3000,
                    }).showToast();
                } finally {
                    m.redraw();
                }
            };

            const CompanyLogo = () => [
                m("div", { class: "col-12 d-flex flex-column justify-content-center align-items-center gap-3" }, [
                    m("h3", "Logo de la Compañía"),
                    m("img", {
                        src: company.image_preview || company.image_route  ,
                        style: {
                            width: "300px",
                            height: "300px",
                            objectFit: "contain",
                            borderRadius: "10px",
                            border: "1px solid #ccc",
                            backgroundColor: "#f9f9f9"
                        }
                    }),
                    m("div.pt-2.text-center", [
                        m("label.form-label.ps-1", "Selecciona un nuevo logo..."),
                        m("input.form-control", {
                            style: { ...style._input_main },
                            required: true,
                            type: "file",
                            accept: "image/*",
                            oninput: (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    company.logo_img = file;

                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        company.image_preview = event.target.result;
                                        m.redraw();
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }
                        })
                    ])
                ])
            ];




            const GeneralInformation = () =>
                [
                    m("p", { class: "fw-semibold text-center text-uppercase fs-3 " }, "Configuracón General"),
                    m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                        m("div", { class: "row" }, [
                            // Nombre
                            m("div", { class: "col-md-12 col-lg-6 pt-2" }, [
                                m("label.form-label.ps-1", `Nombre`),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: user.name,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => user.name = e.target.value
                                })
                            ]),
                            // Apellido
                            m("div", { class: "col-md-12 col-lg-6 pt-2" }, [
                                m("label.form-label.ps-1", `Apellidos`),
                                m("input.form-control", {
                                    style: { ...style._input_secondary },
                                    value: user.lastName,
                                    type: "text",
                                    required: true,
                                    oninput: (e) => user.lastName = e.target.value
                                }),
                            ]),
                            // Telefono
                            m("div.col-md-12.col-lg-6.py-3", [
                                m("label.form-label.ps-1", "Telefono"),
                                m("input.form-control", {
                                    style: { ...style._input_main },
                                    value: user.phone,
                                    required: true,
                                    oninput: (e) => user.phone = e.target.value
                                })
                            ]),
                            //  Rol
                            m("div.col-md-12.col-lg-6.py-3", [
                                m("label.form-label.ps-1", "Rol"),
                                m("input.form-control[readonly]", {
                                    style: { ...style._input_secondary },
                                    value: user.role,
                                    oninput: (e) => user.role = e.target.value
                                })
                            ]),
                            // Email
                            m("div.col-lg-6.py-3", [
                                m("label.form-label.ps-1", "Email"),
                                m("input.form-control", {
                                    type: "email",
                                    required: true,
                                    style: { ...style._input_main },
                                    value: user?.email || "",
                                    oninput: e => user.email = e.target.value
                                })
                            ]),
                            // Confirmación Email
                            m("div.col-lg-6.py-3", [
                                m("label.form-label.ps-1", "Confirmación Email"),
                                m("input.form-control", {
                                    type: "email",
                                    required: true,
                                    style: { ...style._input_secondary },
                                    value: user?.confirmEmail || "",
                                    oninput: e => user.confirmEmail = e.target.value
                                }),
                                (user.confirmEmail && user.email !== user.confirmEmail)
                                    ? m("div.text-danger.ps-1.pt-1", "Los emails no coinciden")
                                    : null,
                                (user.confirmEmail && user.email == user.confirmEmail)
                                    ? m("div.text-success.ps-1.pt-1", "Los emails  coinciden")
                                    : null
                            ]),

                        ]),

                    ])]

            const ResetPassword = () => [
                m("h3", { class: "row" }, "Actualizando contraseña"),
                m("div", { class: "row" }, [
                    // Contraseña vieja
                    m("div.py-3", [
                        m("label.form-label.ps-1", "Contraseña antigua *"),
                        m("input.form-control", {
                            style: { ...style._input_main },
                            type: "password",
                            required: true,
                            oninput: (e) => user.oldPassword = e.target.value
                        })
                    ]),
                    // Contraseña nueva
                    m("div.py-3", [
                        m("label.form-label.ps-1", "Contraseña nueva *"),
                        m("input.form-control", {
                            style: { ...style._input_main },
                            type: "password",
                            required: true,
                            oninput: (e) => user.newPassword = e.target.value
                        })
                    ]),
                    // Confirmación password
                    m("div.py-3", [
                        m("label.form-label.ps-1", "Contraseña confirmación *"),
                        m("input.form-control", {
                            type: "password",
                            required: true,
                            style: { ...style._input_secondary },
                            value: user?.passwordConfirmation || "",
                            oninput: e => user.passwordConfirmation = e.target.value
                        }),
                        (user.passwordConfirmation && user.newPassword !== user.passwordConfirmation)
                            ? m("span.text-danger.ps-1.pt-1", "Las contraseñas no coinciden")
                            : null,
                        (user.passwordConfirmation && user.newPassword == user.passwordConfirmation)
                            ? m("span.text-success.ps-1.pt-1", "Las contraseñas coinciden")
                            : null
                    ]),
                ])]

            const CompanyInformation = () => [
                m("p", { class: "fw-semibold text-center text-uppercase fs-3" }, "Información de la Compañía"),
                m("div", { class: "row py-3 px-0 m-0 d-flex justify-content-between" }, [
                    m("div", { class: "row" }, [
                        // Nombre
                        m("div", { class: "col-md-12 col-lg-6 pt-2" }, [
                            m("label.form-label.ps-1", "Nombre de la empresa"),
                            m("input.form-control", {
                                style: { ...style._input_main },
                                value: company.name,
                                type: "text",
                                required: true,
                                oninput: (e) => company.name = e.target.value
                            })
                        ]),
                        // NIF
                        m("div", { class: "col-md-12 col-lg-6 pt-2" }, [
                            m("label.form-label.ps-1", "NIF"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                value: company.nif,
                                type: "text",
                                required: true,
                                oninput: (e) => company.nif = e.target.value
                            })
                        ]),
                        // Teléfono
                        m("div.col-md-12.col-lg-6.py-3", [
                            m("label.form-label.ps-1", "Teléfono"),
                            m("input.form-control", {
                                style: { ...style._input_main },
                                value: company.phone,
                                required: true,
                                oninput: (e) => company.phone = e.target.value
                            })
                        ]),
                        // Email
                        m("div.col-md-12.col-lg-6.py-3", [
                            m("label.form-label.ps-1", "Email"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                value: company.email,
                                type: "email",
                                required: true,
                                oninput: (e) => company.email = e.target.value
                            })
                        ]),
                        // Dirección
                        m("div.col-md-12.py-3", [
                            m("label.form-label.ps-1", "Dirección"),
                            m("input.form-control", {
                                style: { ...style._input_main },
                                value: company.address,
                                required: false,
                                oninput: (e) => company.address = e.target.value
                            })
                        ]),
                        // URL Logo
                        m("div.col-md-12.py-3", [
                            m("label.form-label.ps-1", "URL del Logo"),
                            m("input.form-control", {
                                style: { ...style._input_secondary },
                                value: company.url_logo,
                                required: false,
                                type: "url",
                                oninput: (e) => company.url_logo = e.target.value
                            })
                        ])
                    ])
                ])
            ];


            const Botones = () => [
                m("hr.mt-2"),
                // Botones
                m("div.col-12.d-flex.justify-content-center.my-5", [
                    m("div.col-md-8.d-flex.justify-content-evenly", [
                        m(Button, {
                            closeModal: true,
                            bclass: "btn-danger",
                        }, [m("i.fa.fa-arrow-left.me-2.ms-2.text-light"), "Cancelar",]),
                        m(Button, {
                            type: "submit",
                            style: { backgroundColor: "var(--mainPurple)" }
                        }, ["Aceptar", m("i.fa.fa-check.me-2.ms-2", { style: { color: "white" } })]),
                    ])
                ]),
            ]

            return m("div", { class: "col-11 d-flex flex-column justify-content-center" }, [
                m("h1.py-5.text-uppercase.text-center", "configuración de Mi perfil"),
                m("div", {
                    class: "col-12 p-3 rounded",
                    style: { backgroundColor: "var(--mainWhite)", boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" }
                }, [
                    m("div.accordion.accordion-flush", { id: "accordionProfile" }, [
                        // Your Photo
                        m("div.accordion-item", [
                            m("h2.accordion-header", { id: "headingOne" }, [
                                m("button.accordion-button", {
                                    type: "button",
                                    "data-bs-toggle": "collapse",
                                    "data-bs-target": "#collapseOne",
                                    "aria-expanded": "true",
                                    "aria-controls": "collapseOne"
                                }, "Tu Foto")
                            ]),
                            m("div.accordion-collapse collapse show", {
                                id: "collapseOne",
                                "aria-labelledby": "headingOne",
                                "data-bs-parent": "#accordionProfile"
                            }, [
                                m("form", {
                                    class: "d-flex align-items-center justify-content-center flex-column pt-5",
                                    onsubmit: handleLogoSubmit,
                                }, [
                                    CompanyLogo(),
                                    Botones()
                                ])
                            ])
                        ]),
                        // General Information
                        m("div.accordion-item", [
                            m("h2.accordion-header", { id: "headingTwo" }, [
                                m("button.accordion-button collapsed", {
                                    type: "button",
                                    "data-bs-toggle": "collapse",
                                    "data-bs-target": "#collapseTwo",
                                    "aria-expanded": "false",
                                    "aria-controls": "collapseTwo"
                                }, "Información General")
                            ]),
                            m("div.accordion-collapse collapse", {
                                id: "collapseTwo",
                                "aria-labelledby": "headingTwo",
                                "data-bs-parent": "#accordionProfile"
                            }, [
                                m("form", {
                                    class: "d-flex align-items-center justify-content-center flex-column pt-5",
                                    onsubmit: handleFormSubmit,
                                }, [
                                    GeneralInformation(),
                                    Botones()
                                ])
                            ])
                        ]),
                        // General Information
                        m("div.accordion-item", [
                            m("h2.accordion-header", { id: "headingTwo" }, [
                                m("button.accordion-button collapsed", {
                                    type: "button",
                                    "data-bs-toggle": "collapse",
                                    "data-bs-target": "#collapseThree",
                                    "aria-expanded": "false",
                                    "aria-controls": "collapseThree"
                                }, "Información de la compañía")
                            ]),
                            m("div.accordion-collapse collapse", {
                                id: "collapseThree",
                                "aria-labelledby": "headingThree",
                                "data-bs-parent": "#accordionProfile"
                            }, [
                                m("form", {
                                    class: "d-flex align-items-center justify-content-center flex-column pt-5",
                                    onsubmit: handleCompanyFormSubmit,
                                }, [
                                    CompanyInformation(),
                                    Botones()
                                ])
                            ])
                        ]),
                        // Reset Password
                        m("div.accordion-item", [
                            m("h2.accordion-header", { id: "headingFour" }, [
                                m("button.accordion-button collapsed", {
                                    type: "button",
                                    "data-bs-toggle": "collapse",
                                    "data-bs-target": "#collapseFour",
                                    "aria-expanded": "false",
                                    "aria-controls": "collapseFour"
                                }, "Cambiar Contraseña")
                            ]),
                            m("div.accordion-collapse collapse", {
                                id: "collapseFour",
                                "aria-labelledby": "headingFour",
                                "data-bs-parent": "#accordionProfile"
                            }, [
                                m("form", {
                                    class: "d-flex align-items-center justify-content-center flex-column pt-5",
                                    onsubmit: handleFormResetPassword,
                                }, [
                                    ResetPassword(),
                                    Botones()
                                ])
                            ])
                        ])
                    ])
                ])
            ])
        }
    }
}

