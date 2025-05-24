export function SpinnerLoading() {
    return {
        view: function () {
            return m("div.d-flex.justify-content-center.align-items-center.flex-column.gao-5", { style: { height: "30vh" } }, [
                m("h2", "CARGANDO..."),
                m("div.spinner-border.text-primary", { role: "status" }, [
                    m("span.visually-hidden", "Cargando...")
                ])
            ])
        }
    }
}

