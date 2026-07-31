import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

interface ExamCountdownProps {
  daysUntilExam: number
}

function ExamCountdown({ daysUntilExam }: ExamCountdownProps) {
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]

  if (daysUntilExam < 0) {
    return <span className="text-sm font-medium text-slate-500">{text.examDatePassed}</span>
  }

  if (daysUntilExam === 0) {
    return <span className="text-sm font-bold text-amber-700">{text.examToday}</span>
  }

  return (
    <span className="text-sm font-bold text-emerald-700">
      {daysUntilExam} {text.daysUntilExam}
    </span>
  )
}

export default ExamCountdown
