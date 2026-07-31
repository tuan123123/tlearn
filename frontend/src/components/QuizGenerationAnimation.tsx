import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function QuizGenerationAnimation() {
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]

  return (
    <div className="mt-6 overflow-hidden rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300 opacity-30" />
          <span className="absolute inset-3 animate-bounce rounded-full bg-emerald-600" />
          <span className="absolute bottom-0 right-0 rounded-full bg-amber-300 px-2 py-1 text-xs">
            AI
          </span>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-emerald-700">
            {text.cookingDiagnostic}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            {text.generatingQuiz}
          </h2>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {text.generationSteps.map((step, index) => (
          <div
            className="quiz-generation-step rounded-2xl bg-white/80 p-4 text-sm font-semibold text-slate-700 shadow-sm"
            key={step}
            style={{ animationDelay: `${index * 220}ms` }}
          >
            <span className="mr-2 text-emerald-700">✦</span>
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuizGenerationAnimation
