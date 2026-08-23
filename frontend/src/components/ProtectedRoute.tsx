import { Navigate, Outlet } from "react-router-dom"

import { useAuthStore } from "../store/authStore"
import AppHeader from "./AppHeader"

function ProtectedRoute() {
  const token = useAuthStore((state) => state.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="editorial-app-layout min-h-screen">
      <AppHeader />
      <Outlet />
    </div>
  )
}

export default ProtectedRoute
