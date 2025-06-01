export function Button() {
    return {
        view: function ({ attrs, children }) {
            const { actions, style, type = "button", closeModal = false, bclass = "btn btn-success", key = "" } = attrs
            return m("button", {
                "data-bs-dismiss": closeModal ? "modal" : "",
                key: key,
                type: type,
                class: `btn rounded-pill fw-normal py-2 ${bclass}`,
                onclick: actions,
                style: { fontWeight: "bold", ...style }
            }, children)
        },
    }
}
