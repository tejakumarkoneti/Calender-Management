const API_BASE = "http://localhost:3000/api";

export function getToken() {
  return localStorage.getItem("token");
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  return res.json();
}
