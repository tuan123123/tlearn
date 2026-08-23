import { Link, useLocation } from "react-router-dom"

import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"
import ThemeToggle from "./ThemeToggle"

function AppHeader() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const feedbackLabel = language === "vi" ? "Góp ý" : "Feedback"

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule-strong)] bg-[var(--header)] backdrop-blur-xl">
      <div className="editorial-kicker border-b border-[var(--rule)] px-5 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <span>Student edition · 2026</span>
          <span className="hidden sm:inline">{user?.display_name ?? "Tlearn learner"}</span>
        </div>
      </div>

      <nav
        aria-label="App navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-3 sm:px-6 lg:px-8"
      >
        <Link className="group flex items-baseline gap-2" to="/dashboard">
          <span className="editorial-display text-2xl font-bold leading-none tracking-[-0.04em]">
            Tlearn
          </span>
          <span className="h-2 w-2 bg-[var(--accent)] transition-transform group-hover:rotate-45" />
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <Link
            className="editorial-kicker hidden min-h-11 items-center px-3 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--ink)] sm:inline-flex"
            to="/dashboard"
          >
            {text.dashboard}
          </Link>
          <Link
            className="editorial-kicker hidden min-h-11 items-center px-3 text-[11px] uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--ink)] md:inline-flex"
            state={{ from: location.pathname }}
            to="/feedback"
          >
            {feedbackLabel}
          </Link>
          <ThemeToggle />
          <button
            className="editorial-kicker min-h-11 border border-[var(--rule-strong)] px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--ink)] transition hover:bg-[var(--surface)] sm:px-4"
            onClick={clearAuth}
            type="button"
          >
            {text.logOut}
          </button>
        </div>
      </nav>
    </header>
  )
}

export default AppHeader
