import type { Question } from "../api/types"

interface MockExamNavigatorProps {
  answers: Record<string, string>
  currentIndex: number
  flagged: Record<string, boolean>
  questions: Question[]
  onSelectQuestion: (index: number) => void
}

function MockExamNavigator({
  answers,
  currentIndex,
  flagged,
  questions,
  onSelectQuestion,
}: MockExamNavigatorProps) {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5">
        {questions.map((question, index) => {
          const isAnswered = Boolean(answers[question.id]?.trim())
          const isFlagged = Boolean(flagged[question.id])
          const isCurrent = index === currentIndex
          return (
            <button
              className={[
                "h-10 rounded-xl text-sm font-bold transition",
                isCurrent ? "ring-2 ring-slate-950 ring-offset-2" : "",
                isFlagged
                  ? "bg-amber-400 text-slate-950"
                  : isAnswered
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-700 border border-slate-300",
              ].join(" ")}
              key={question.id}
              type="button"
              onClick={() => onSelectQuestion(index)}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </aside>
  )
}

export default MockExamNavigator
