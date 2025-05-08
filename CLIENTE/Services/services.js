// IMPORTADOR DE CONSTANTES
import {
    URL_ESTIMATES,
    URL_CLIENTS,
    URL_PROJECTS,
    URL_MATERIALS,
    URL_LABOR_TYPES,
} from "../Util/constantes.js"

// IMPORTADOR DE FUNCIONES
import { request } from "../Util/util.js";


// PETICIONES GET
export async function fetchEstimates() {
    //const data = await request("GET", URL_BUDGETS);
    return (await request("GET", URL_ESTIMATES));
}


export async function fetchEstimate(id) {
    return await request("GET", `${URL_ESTIMATES}/${id}`);
}

export async function fetchClients() {
    return await request("GET", URL_CLIENTS);
}

export async function fetchProjects() {
    return await request("GET", URL_PROJECTS);
}


export async function fetchMaterials() {
    return await request("GET", URL_MATERIALS);
}

export async function fetchLaborTypes() {
    return await request("GET", URL_LABOR_TYPES);
}




// PETICIONES POST
export async function createBudget(body) {
    return await request("POST", URL_BUDGETS, body);
}



//PETICIONES PUT - PATCH
export async function updateBudget(body, id) {
    return await request("PUT", `${URL_BUDGETS}/${id}`, body);
}



// PETCIONES DELETE
export async function deleteEstimate(id) {
    return await request("DELETE", `${URL_BUDGETS}/${id}`);
}
