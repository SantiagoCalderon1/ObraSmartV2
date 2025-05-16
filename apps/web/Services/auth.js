const URL_LOGIN = `${import.meta.env.VITE_API_URL}/api/login`

export async function loginUser(body) {
    try {
        const response = await m.request({
            method: "POST",
            url: URL_LOGIN,
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
        console.error("Error en loginUser:", error);
        throw error;
    }
}
