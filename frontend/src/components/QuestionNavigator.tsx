import type { Question } from "../api/types"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

interface QuestionNavigatorProps {
  answers: Record<string, string>
  currentIndex: number
  questions: Question[]
  onSelectQuestion: (index: number) => void
}

function QuestionNavigator({
  answers,
  currentIndex,
  questions,
  onSelectQuestion,
}: QuestionNavigatorProps) {
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-slate-950">{text.questions}</h2>
        <div className="flex gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            {text.done}
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            {text.empty}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-10 lg:grid-cols-5">
        {questions.map((question, index) => {
          const isAnswered = Boolean(answers[question.id]?.trim())
          const isCurrent = index === currentIndex

          return (
            <button
              aria-label={`${text.question} ${index + 1}`}
              className={[
                "h-10 rounded-xl text-sm font-bold transition",
                isCurrent ? "ring-2 ring-emerald-700 ring-offset-2" : "",
                isAnswered
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
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

export default QuestionNavigator
