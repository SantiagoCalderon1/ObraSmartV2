export function PageEstructure() {
    return {
        view: function ({ children }) {
            return m("div.container.col-11", { style: { maxWidth: "1800px" } }, [
                m("div.row", [
                    m("div", {
                        class: "pb-5 col-12 col-xl-9 d-flex justify-content-center "
                    }, [
                        children[0]
                    ]),
                    children[1] && m("div", {
                        class: "pb-5 col-12 col-xl-3 d-flex justify-content-center"
                    }, [
                        children[1]
                    ])
                ])
            ])
        }
    }
}