const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export function storeAuthSession({ user, token, rememberMe = false }) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("authToken", token);

  if (rememberMe && user?.email) {
    localStorage.setItem("rememberedEmail", user.email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }
}

export function clearAuthSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
}
