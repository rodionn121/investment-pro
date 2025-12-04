const API_BASE_URL = "https://database-investpro.onrender.com"

interface ApiOptions extends RequestInit {
  token?: string
}

export async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...requestOptions } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...requestOptions.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...requestOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `API Error: ${response.status}`)
  }

  return response.json()
}
