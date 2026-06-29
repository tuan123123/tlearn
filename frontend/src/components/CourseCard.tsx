import { useNavigate } from "react-router-dom"

import type { Course } from "../api/types"
import ExamCountdown from "./ExamCountdown"

interface CourseCardProps {
  course: Course
}

function CourseCard({ course }: CourseCardProps) {
  const navigate = useNavigate()

  return (
    <button
      className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      type="button"
      onClick={() => navigate(`/courses/${course.id}/setup`)}
    >
      <h2 className="text-xl font-bold text-slate-950">{course.name}</h2>
      <p className="mt-1 text-sm text-slate-600">{course.university}</p>
      <div className="mt-4">
        <ExamCountdown daysUntilExam={course.days_until_exam} />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-600">
        {course.uploaded_file_count} uploaded file
        {course.uploaded_file_count === 1 ? "" : "s"}
      </p>
    </button>
  )
}

export default CourseCard
