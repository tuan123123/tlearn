import { useMutation, useQuery } from "@tanstack/react-query"

import { getCurrentUser, loginUser, registerUser } from "../api/auth"
import { useAuthStore } from "../store/authStore"

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    enabled: Boolean(token),
  })
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => setAuth(data.access_token, data.user),
  })
}

export function useRegister() {
  const setAuth = useAuthStore((state) => state.setAuth)

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => setAuth(data.access_token, data.user),
  })
}
