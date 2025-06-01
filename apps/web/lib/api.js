import { isAuthenticated } from "./auth.js";

export const api = {}

async function request(method, url, body = null, routeSet = true) {
    const token = isAuthenticated()

    if (!token) {
        //console.log("No hay token, redirigiendo a /login")
        m.route.set("/login")
        return
    }
    try {
        const data = await m.request({
            method: method,
            url: `${import.meta.env.API_URL}/api/${url}`,
            body: body ? body : null,
            headers: {
                "Content-Type": body ? "application/json" : "",
                "Authorization": `Bearer ${token}`
            }
        })
        return data
    } catch (error) {
        //console.error("Error en la petición:", error)
        routeSet ? m.route.set("/login") : null
        throw error
    }
}

/* 
 * Aquí indicamod la url de cada recurso, ya no harían falta constantes. 
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
    // index: GET /resources
    index: () => request("GET", url),
    // show: GET /resources/:id
    show: (id) => request("GET", `${url}/${id}`),
    // create: POST /resources
    create: (body) => request("POST", url, body),
    // destroy: DELETE /resources/:id
    destroy: (id) => request("DELETE", `${url}/${id}`),
    // update: PATCH /resources/:id
    update: (id, body) => request("PATCH", `${url}/${id}`, body),
  };
});

// Ejemplo de uso:
// await api.estimate.index();
// await api.estimate.show(123);
// await api.client.create({ name: 'ACME' });
// await api.project.update(45, { title: 'New Title' });
// await api.user.destroy(7);
