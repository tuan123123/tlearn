import { Link, useNavigate } from "react-router-dom"

import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function PageBackActions() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const text = uiText[languageFromUser(user?.language)]

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="editorial-kicker border border-slate-300 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-700 transition hover:bg-[var(--surface)]"
        type="button"
        onClick={() => navigate(-1)}
      >
        {text.previousPage}
      </button>
      <Link
        className="editorial-kicker bg-emerald-700 px-4 py-3 text-xs font-bold uppercase tracking-[0.1em] text-white transition hover:-translate-y-0.5"
        to="/dashboard"
      >
        {text.dashboard}
      </Link>
    </div>
  )
}

export default PageBackActions
