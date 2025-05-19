export function isAuthenticated() {
  return localStorage.getItem("token") || sessionStorage.getItem("token")
}

export async function login(body) {
  try {
    const response = await m.request({
      method: "POST",
      url: `${import.meta.env.API_URL}/api/login`,
      body,
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
