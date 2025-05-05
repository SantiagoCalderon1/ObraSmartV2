
function HomePage() {
    let style = { width: "100%", minHeight: "92.5vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0" };
    return {
        oncreate: () => { window.scrollTo(0, 0); },
        view: function () {
            return m("div", { style: { ...style } }, "holaaa");
        }
    }
}

export { HomePage}