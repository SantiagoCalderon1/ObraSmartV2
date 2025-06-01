export function SpinnerLoading() {
    let style = { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" };

    return {
        view: function () {
            return m("div", { style },
                m("div.d-flex.justify-content-center.align-items-center.flex-column.gao-5", { style: { height: "30vh" } }, [
                    m("h2", "CARGANDO"),
                    m("div.spinner-border.text-primary", { role: "status" }, [
                        m("span.visually-hidden", "Cargando...")
                    ])
                ])
            )
        }
    }
}

