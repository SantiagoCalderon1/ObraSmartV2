import "dotenv/config";

/* Sección de Constantes Globales */

// BreakPoints API

// Generales
export const URL_LOGIN = `${process.env.API_URL}/api/login`
export const URL_LOGOUT = `${process.env.API_URL}/api/logout`
export const URL_REGISTER = `${process.env.API_URL}/api/register`

// Usuario
export const URL_AUTH = `${process.env.API_URL}/api/me`;
export const URL_USER = `${process.env.API_URL}/api/user`;

// Presupuestos
export const URL_ESTIMATES = `${process.env.API_URL}/api/estimates`;

// Cliente
export const URL_CLIENTS = `${process.env.API_URL}/api/clients`;

// Usuarios
const URL_USERS = `${process.env.API_URL}/api/users`;

// Proyectos
export const URL_PROJECTS = `${process.env.API_URL}/api/projects`;
const URL_PROJECT_LOGS = `${process.env.API_URL}/api/project-logs`;

// Movieminetos de stock
const URL_STOCK_MOVEMENTS = `${process.env.API_URL}/api/stock-movements`;

// Materiales
export const URL_MATERIALS = `${process.env.API_URL}/api/materials`;
const URL_ESTIMATE_MATERIALS = `${process.env.API_URL}/api/estimate-materials`

// Servicios
export const URL_LABOR_TYPES = `${process.env.API_URL}/api/labor-types`;
const URL_ESTIMATE_LABOR = `${process.env.API_URL}/api/estimate-labor`

// Facturas
export const URL_INVOICES = `${process.env.API_URL}/api/invoices`
export const URL_PAYMENTS = `${process.env.API_URL}/api/payments`




