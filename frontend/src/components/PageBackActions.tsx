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
        className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
        type="button"
        onClick={() => navigate(-1)}
      >
        {text.previousPage}
      </button>
      <Link
        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-bold text-white"
        to="/"
      >
        {text.dashboard}
      </Link>
    </div>
  )
}

export default PageBackActions
