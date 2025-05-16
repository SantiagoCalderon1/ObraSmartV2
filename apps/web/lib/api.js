export const api = {}

async function request(method, url, body = null, routeSet = true) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token")
    // TODO: lo mismo que en el otro caso, actualiza la logica que comprueba esto
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

/* 
 * Aquí indicas la url de cada recurso, ya no harían falta constantes. 
 * Lo actualizamos todo desde aquí
 * */
const resourceMap = {
  laborType: "labor-types",
  material: "materials",
  estimate: "estimates",
  project: "projects",
  invoice: "invoices",
  payment: "payments",
  client: "clients",
  user: "user",
  auth: "me",
};

Object.entries(resourceMap).forEach(([name, url]) => {
  api[name] = {
    // list: GET /resources
    index: () => request("GET", url),
    // get: GET /resources/:id
    show: (id) => request("GET", `${url}/${id}`),
    // new: POST /resources
    create: (body) => request("POST", url, body),
    // delete: DELETE /resources/:id
    destroy: (id) => request("DELETE", `${url}/${id}`),
    // update: PATCH /resources/:id
    update: (id, body) => request("PATCH", `${url}/${id}`, body),
  };
});

// Example usage:
// await api.estimate.list();
// await api.estimate.get(123);
// await api.client.new({ name: 'ACME' });
// await api.project.update(45, { title: 'New Title' });
// await api.user.delete(7);
