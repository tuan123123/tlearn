import { Link, useLocation } from "react-router-dom"

import ThemeToggle from "./ThemeToggle"

function PublicPageHeader() {
  const location = useLocation()
  const isLoginPage = location.pathname === "/login"

  return (
    <header className="border-b border-[var(--rule-strong)] bg-[var(--header)] backdrop-blur-xl">
      <nav
        aria-label="Public navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8"
      >
        <Link className="group flex items-baseline gap-2" to="/">
          <span className="editorial-display text-3xl font-bold leading-none tracking-[-0.04em]">
            Tlearn
          </span>
          <span className="h-2 w-2 bg-[var(--accent)] transition-transform group-hover:rotate-45" />
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            className="editorial-kicker hidden min-h-11 items-center px-3 text-xs uppercase tracking-[0.12em] text-[var(--muted)] hover:text-[var(--ink)] sm:inline-flex"
            to="/feedback"
          >
            Feedback
          </Link>
          <ThemeToggle />
          <Link
            className="editorial-kicker inline-flex min-h-11 items-center bg-[var(--ink)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--paper)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
            to={isLoginPage ? "/register" : "/login"}
          >
            {isLoginPage ? "Create account" : "Log in"}
          </Link>
        </div>
      </nav>
    </header>
  )
}

export default PublicPageHeader
