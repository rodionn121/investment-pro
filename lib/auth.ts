import { apiCall } from "./api-client"

export interface User {
  id: number
  name: string
  email: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiCall("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function register(name: string, email: string, password: string): Promise<User> {
  return apiCall("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })
}

export async function getMe(token: string): Promise<User> {
  return apiCall("/api/auth/me", { token })
}
