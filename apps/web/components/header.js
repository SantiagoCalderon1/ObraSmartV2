export function Header() {
    const MENU_ITEM = [
        { label: "Inicio   ", route: "/home", icon: "fa-home" },
        { label: "Proyectos   ", route: "/projects", icon: "fa-hammer" },
        { label: "Presupuestos   ", route: "/estimates", icon: "fa-file-signature" },
        { label: "Facturas   ", route: "/invoices", icon: "fa-file-invoice-dollar" },
        { label: "Clientes   ", route: "/clients", icon: "fa-users" },
        { label: "Materiales   ", route: "/materials", icon: "fa-shapes" },
        { label: "Mi Cuenta   ", route: "/my-account", icon: "fa-circle-user" }
    ]

    return {
        view: function () {
            return m('header.navbar.bg-light.fixed-top', {
                style: { height: "7.5vh", width: "100%", boxShadow: "0px 10px 50px rgba(0, 0, 0, 0.2)", }
            },
                m('.container-fluid', [
                    m("div", { style: { height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 1rem" } }, [
                        m('img', {
                            src: `/logosObraSmart/logo-1.png`, style: { width: "75px", height: "6vh", cursor: "pointer" },
                            onclick: () => m.route.set("/home")
                        }
                        ),
                        m(MainMenuItems, { items: MENU_ITEM }),
                        m(MainMenuItems, { items: [{ route: "/logout", icon: "fa-arrow-right-from-bracket", }] }),
                        m('button.navbar-toggler.d-block.d-xl-none', {
                            type: 'button',
                            'data-bs-toggle': 'offcanvas',
                            'data-bs-target': '#offcanvasNavbar',
                            'aria-controls': 'offcanvasNavbar'
                        }, m('span.navbar-toggler-icon')),
                        m('.offcanvas.offcanvas-end', {
                            tabindex: '-1',
                            id: 'offcanvasNavbar',
                            'aria-labelledby': 'offcanvasNavbarLabel'
                        }, [
                            m('.offcanvas-header', [
                                m('button.btn-close', {
                                    type: 'button',
                                    'data-bs-dismiss': 'offcanvas',
                                    'aria-label': 'Close'
                                })
                            ]),
                            m(Sidebar, { items: [...MENU_ITEM, { route: "/logout", icon: "fa-arrow-right-from-bracket", }] })
                        ])
                    ]),
                ])
            );
        }
    }

    function Sidebar() {
        return {
            view: function ({ attrs }) {
                return m('div.offcanvas-body', [
                    m("ul.text-end", { style: { height: "100%", width: "100%", maxWidth: "1200px", padding: "0", margin: "0", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "50px" } }, [
                        attrs.items.map(({ label, route, icon }, index) =>
                            m('li', {
                                'data-bs-dismiss': 'offcanvas',
                                style: { width: "100%", textAlign: "end", listStyle: "none", fontWeight: "500", fontSize: "1.5rem", paddingRight: "2rem", paddingTop: index == (attrs.items.length - 1) ? "25px" : "" },
                            },
                                m(m.route.Link, { href: route, style: { textDecoration: "none", color: "var(--secondaryBlack)", paddingRight: "20px" }, }, [label, m('i.fa', { class: icon, style: { fontSize: "1.75rem" } })]),
                            )
                        )
                    ])
                ])
            }
        }
    }

    function MainMenuItems() {
        let rute
        function getFirstSegment(route) {
            const parts = route.split('/').filter(Boolean);
            return parts.length > 0 ? '/' + parts[0] : '/';
        }

        return {
            onupdate: () => {
                rute = getFirstSegment(m.route.get());
            },
            view: function ({ attrs }) {
                return m("ul.d-none.d-xl-flex.justify-content-center", { style: { maxWidth: "1200px", gap: "2rem", padding: "0", margin: "0", whiteSpace: "nowrap" } }, [
                    attrs.items.map(({ label, route, icon }, index) =>
                        m('li', {
                            style: { width: "100%", textAlign: "center", listStyle: "none", fontWeight: "600", fontSize: "1.25rem", fontWeight: (rute === route) ? "900" : "600" },
                            onmouseenter: function (e) { e.target.style.fontWeight = "900"; },
                            onmouseleave: function (e) { e.target.style.fontWeight = "600"; },
                        },
                            m(m.route.Link, { href: route, style: { textDecoration: "none", color: "var(--secondaryBlack)" }, }, label ? label : m('i.fa', { class: icon, style: { fontSize: "1.75rem" } }))
                        )
                    )
                ])
            }
        }
    }
}
