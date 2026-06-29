import { Route, Routes } from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"
import DashboardPage from "./pages/DashboardPage"
import CourseSetupPage from "./pages/CourseSetupPage"
import LoginPage from "./pages/LoginPage"
import NewCoursePage from "./pages/NewCoursePage"
import RegisterPage from "./pages/RegisterPage"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/courses/new" element={<NewCoursePage />} />
        <Route path="/courses/:courseId/setup" element={<CourseSetupPage />} />
        <Route
          path="/courses/:courseId"
          element={
            <main className="mx-auto max-w-3xl px-6 py-10">
              <h1 className="text-4xl font-bold text-slate-950">Course details</h1>
              <p className="mt-3 text-slate-600">
                This detail page is a placeholder for the next feature.
              </p>
            </main>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
