import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

interface ProgressBarProps {
  answered: number
  total: number
}

function ProgressBar({ answered, total }: ProgressBarProps) {
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]
  const percent = total === 0 ? 0 : Math.round((answered / total) * 100)

  return (
    <div>
      <div className="flex justify-between text-sm font-semibold text-slate-600">
        <span>
          {answered} {text.of} {total} {text.answered}
        </span>
        <span>{percent}%</span>
      </div>
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
