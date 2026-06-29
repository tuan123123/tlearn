interface ExamCountdownProps {
  daysUntilExam: number
}

function ExamCountdown({ daysUntilExam }: ExamCountdownProps) {
  if (daysUntilExam < 0) {
    return <span className="text-sm font-medium text-slate-500">Exam date passed</span>
  }

  if (daysUntilExam === 0) {
    return <span className="text-sm font-bold text-amber-700">Exam is today</span>
  }

  return (
    <span className="text-sm font-bold text-emerald-700">
      {daysUntilExam} days until exam
    </span>
  )
}

export default ExamCountdown
