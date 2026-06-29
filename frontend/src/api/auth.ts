import { apiClient } from "./client"
import type { AuthResponse, User } from "./types"

interface RegisterRequest {
  display_name: string
  email: string
  password: string
}

interface LoginRequest {
  email: string
  password: string
}

export async function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload)
  return response.data
}

export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload)
  return response.data
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>("/auth/me")
  return response.data
}
