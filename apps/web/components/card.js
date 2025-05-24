export function Card() {
    let containerStyle = {
        minHeight: "10vh",
        maxHeight: "45vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        padding: "25px",
        borderRadius: "8px",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        overflow: "hidden",
        gap: "1.30rem"
    }

    return {
        view: ({ attrs, children }) => {
            return [
                m("h2.py-2.text-uppercase", attrs.title),
                m("div.col-11.col-md-10.text-start", { style: containerStyle }, [
                    children
                ])
            ]
        }
    }
}