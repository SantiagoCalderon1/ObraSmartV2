// api.js

export async function request(method, url, body = null, routeSet = true) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    if (!token) {
        m.route.set("/login")
        return
    }
    let headers = {
        "Authorization": `Bearer ${token}`
    }
    // Solo poner Content-Type si no es FormData
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json"
    }
    try {
        const data = await m.request({
            method: method,
            url: url,
            body: body ? body : null,
            headers: headers
        })
        return data
    } catch (error) {
        if (routeSet) m.route.set("/login")
        throw error
    }
}

// funcion para filtar las listas con los datos del input de filtrado
export const filterList = (list, keyword) => list.filter(item => Object.values(item).some(val => String(val).toLowerCase().includes(keyword?.toLowerCase())))


