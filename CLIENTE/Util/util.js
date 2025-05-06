// api.js

export async function request(method, url, body = null, routeSet = true) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
        console.log("No hay token, redirigiendo a /login")
        m.route.set("/login")
        return
    }
    try {
        const data = await m.request({
            method: method,
            url: url,
            body: body ? body : null,
            headers: {
                "Content-Type": body ? "application/json" : "",
                "Authorization": `Bearer ${token}`
            }
        })
        return data
    } catch (error) {
        console.error("Error en la petición:", error)
        routeSet ? m.route.set("/login") : null
        throw error
    }
}



