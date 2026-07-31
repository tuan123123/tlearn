import { Route, Routes } from "react-router-dom"

import ProtectedRoute from "./components/ProtectedRoute"
import FeedbackWidget from "./components/FeedbackWidget"
import DashboardPage from "./pages/DashboardPage"
import FeedbackPage from "./pages/FeedbackPage"
import CourseHomePage from "./pages/CourseHomePage"
import CourseSetupPage from "./pages/CourseSetupPage"
import DiagnosticPage from "./pages/DiagnosticPage"
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/LoginPage"
import MockExamHubPage from "./pages/MockExamHubPage"
import MockExamPage from "./pages/MockExamPage"
import MockExamResultsPage from "./pages/MockExamResultsPage"
import NewCoursePage from "./pages/NewCoursePage"
import ProgressPage from "./pages/ProgressPage"
import QuizPage from "./pages/QuizPage"
import QuizResultsPage from "./pages/QuizResultsPage"
import RegisterPage from "./pages/RegisterPage"
import StudyGuidePage from "./pages/StudyGuidePage"

function App() {
  return (
    <>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/courses/new" element={<NewCoursePage />} />
          <Route path="/courses/:courseId/setup" element={<CourseSetupPage />} />
          <Route path="/courses/:courseId/diagnostic" element={<DiagnosticPage />} />
          <Route path="/courses/:courseId/mock-exams" element={<MockExamHubPage />} />
          <Route path="/courses/:courseId/progress" element={<ProgressPage />} />
          <Route path="/courses/:courseId/study-guide" element={<StudyGuidePage />} />
          <Route path="/mock-exams/:mockExamId" element={<MockExamPage />} />
          <Route path="/mock-exams/:mockExamId/results" element={<MockExamResultsPage />} />
          <Route path="/quizzes/:quizId" element={<QuizPage />} />
          <Route path="/quizzes/:quizId/results" element={<QuizResultsPage />} />
          <Route path="/courses/:courseId" element={<CourseHomePage />} />
        </Route>
      </Routes>
      <FeedbackWidget />
    </>
  )
}

export default App
