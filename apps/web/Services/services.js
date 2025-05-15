// IMPORTADOR DE CONSTANTES
import {
    URL_ESTIMATES,
    URL_CLIENTS,
    URL_PROJECTS,
    URL_MATERIALS,
    URL_LABOR_TYPES,
    URL_INVOICES,
    URL_PAYMENTS,
    URL_AUTH,
    URL_USER
} from "../Util/constantes.js"

// IMPORTADOR DE FUNCIONES
import { request } from "../Util/util.js";


// PETICIONES GET - INDEX ********************************************************************************
export async function fetchEstimates() {  // index
    return (await request("GET", URL_ESTIMATES));
}

export async function fetchClients() { // index
    return await request("GET", URL_CLIENTS);
}

export async function fetchProjects() {  // index
    return await request("GET", URL_PROJECTS);
}

export async function fetchMaterials() {  // index
    return await request("GET", URL_MATERIALS);
}

export async function fetchLaborTypes() { // index
    return await request("GET", URL_LABOR_TYPES);
}

export async function fetchInvoices() { // index
    return await request("GET", URL_INVOICES);
}

export async function fetchPayments() { // index
    return await request("GET", URL_PAYMENTS);
}

export async function fetchUser() { // index
    return await request("GET", URL_AUTH);
}





// PETICIONES GET - SHOW    ********************************************************************************
export async function fetchEstimate(id) { // show
    return await request("GET", `${URL_ESTIMATES}/${id}`);
}

export async function fetchClient(id) { // show
    return await request("GET", `${URL_CLIENTS}/${id}`);
}

export async function fetchProject(id) { // show
    return await request("GET", `${URL_PROJECTS}/${id}`);
}

export async function fetchMaterial(id) { // show
    return await request("GET", `${URL_MATERIALS}/${id}`);
}

export async function fetchLaborType(id) { // show
    return await request("GET", `${URL_LABOR_TYPES}/${id}`);
}

export async function fetchInvoice(id) { // show
    return await request("GET", `${URL_INVOICES}/${id}`);
}

export async function fetchPayment(id) { // show
    return await request("GET", `${URL_PAYMENTS}/${id}`);
}







// PETICIONES POST  ********************************************************************************
export async function createEstimate(body) { // create
    return await request("POST", URL_ESTIMATES, body);
}

export async function createClient(body) { // create
    return await request("POST", URL_CLIENTS, body);
}

export async function createProject(body) { // create
    return await request("POST", URL_PROJECTS, body);
}

export async function createMaterial(body) { // create
    return await request("POST", URL_MATERIALS, body);
}

export async function createLaborType(body) { // create
    return await request("POST", URL_LABOR_TYPES, body);
}


export async function createInvoice(body) { // create
    return await request("POST", URL_INVOICES, body);
}

export async function createPayments(body) { // create
    return await request("POST", URL_PAYMENTS, body);
}





//PETICIONES PUT - PATCH    ********************************************************************************
export async function updateEstimate(body, id) { // update
    return await request("PATCH", `${URL_ESTIMATES}/${id}`, body);
}

export async function updateClient(body, id) { // update
    return await request("PATCH", `${URL_CLIENTS}/${id}`, body);
}

export async function updateProject(body, id) { // update
    return await request("PATCH", `${URL_PROJECTS}/${id}`, body);
}

export async function updateMaterial(body, id) { // update
    return await request("PATCH", `${URL_MATERIALS}/${id}`, body);
}

export async function updateLaborType(body, id) { // update
    return await request("PATCH", `${URL_LABOR_TYPES}/${id}`, body);
}

/* export async function updateInvoice(body, id) { // update
    return await request("PATCH", `${URL_INVOICES}/${id}`, body);
}
 */
export async function updatePayment(body, id) { // update
    return await request("PATCH", `${URL_PAYMENTS}/${id}`, body);
}

export async function updateUser(body, id) { // update
    return await request("PATCH", `${URL_USER}/${id}`, body);
}






// PETCIONES DELETE     ********************************************************************************
export async function deleteEstimate(id) { // destroy
    return await request("DELETE", `${URL_ESTIMATES}/${id}`);
}

export async function deleteClient(id) { // destroy
    return await request("DELETE", `${URL_CLIENTS}/${id}`);
}

export async function deleteProject(id) { // destroy
    return await request("DELETE", `${URL_PROJECTS}/${id}`);
}

export async function deleteMaterial(id) { // destroy
    return await request("DELETE", `${URL_MATERIALS}/${id}`);
}

export async function deleteLaborType(id) { // destroy
    return await request("DELETE", `${URL_LABOR_TYPES}/${id}`);
}

export async function deleteInvoice(id) { // destroy
    return await request("DELETE", `${URL_INVOICES}/${id}`);
}

export async function deletePayment(id) { // destroy
    return await request("DELETE", `${URL_PAYMENTS}/${id}`);
}

export async function deleteUser(id) { // destroy
    return await request("DELETE", `${URL_USER}/${id}`);
}
