export function isAuthenticated() {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
  // TODO: aqui deberias comprobar que el token es valido, esto es un grave problema de seguridad
}

export async function login(email, password) {
  try {
    const response = await m.request({
      method: "POST",
      url: `${import.meta.env.API_URL}/api/login`,
      body: JSON.stringify(email, password),
      headers: {
        "Content-Type": "application/json"
      },
      extract: (xhr) => ({
        status: xhr.status,
        response: JSON.parse(xhr.responseText)
      })
    });
    return response;
  } catch (error) {
    console.error("Error iniciando sesión:", error);
    throw error;
  }
}
