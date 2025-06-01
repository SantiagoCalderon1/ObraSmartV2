export function Card() {
    let containerStyle = {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        overflowX: "auto"
    }

    return {
        view: ({ attrs, children }) => {
            return m("div.col-12.mb-3.d-flex.justify-content-center.align-items-center.flex-column", [
                m("div.col-11.col-md-10.text-start", { style: { ...containerStyle, ...attrs.style } }, [
                    m("h2.py-2.text-uppercase.text-center", attrs.title),
                    children
                ])
            ])
        }
    }
}