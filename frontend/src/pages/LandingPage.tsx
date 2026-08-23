import { Link } from "react-router-dom"

import ThemeToggle from "../components/ThemeToggle"
import { useAuthStore } from "../store/authStore"
import { useThemeStore } from "../store/themeStore"

const workflow = [
  { number: "01", title: "Import", text: "PDF and presentation course files" },
  { number: "02", title: "Map", text: "Reviewed topics with source evidence" },
  { number: "03", title: "Test", text: "Diagnostic and timed mock exams" },
  { number: "04", title: "Focus", text: "Weakness reports and study plans" },
]

const features = [
  {
    number: "01",
    title: "Grounded in your syllabus",
    text: "Tlearn reads the material your lecturer assigned, identifies the topics inside it, and keeps evidence from the original source.",
  },
  {
    number: "02",
    title: "Bilingual by design",
    text: "Students can move through lessons, questions, feedback, and study guidance in English or Vietnamese.",
  },
  {
    number: "03",
    title: "Specific about weakness",
    text: "Results connect every missed question to a topic, skill, and Bloom level so the next study session has a clear purpose.",
  },
]

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About us", href: "#about" },
  { label: "Contact", href: "#contact" },
]

function LandingPage() {
  const token = useAuthStore((state) => state.token)
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === "dark"

  return (
    <div className="editorial-landing min-h-screen overflow-hidden">
      <div aria-hidden="true" className="editorial-paper-texture fixed inset-0 z-0" />

      <a
        className="fixed left-4 top-4 z-[60] -translate-y-24 border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-sm font-bold text-[var(--paper)] transition focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-[var(--rule)] bg-[var(--header)] backdrop-blur-xl">
        <div className="border-b border-[var(--rule)]">
          <div className="editorial-kicker mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] sm:px-6 lg:px-8">
            <span>Vol. 01 · Academic year 2026</span>
            <span className="hidden sm:inline">Microeconomics intelligence for focused study</span>
          </div>
        </div>

        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8"
        >
          <a className="group flex items-baseline gap-2" href="#home">
            <span className="editorial-display text-3xl font-bold leading-none tracking-[-0.04em]">
              Tlearn
            </span>
            <span className="h-2 w-2 bg-[var(--accent)] transition-transform group-hover:rotate-45" />
          </a>

          <div className="editorial-kicker hidden items-center gap-8 text-xs uppercase tracking-[0.15em] text-[var(--muted)] md:flex">
            {navItems.map((item) => (
              <a
                className="border-b border-transparent pb-1 transition hover:border-[var(--accent)] hover:text-[var(--ink)] focus-visible:border-[var(--accent)]"
                href={item.href}
                key={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {token ? (
              <Link
                className="editorial-kicker inline-flex min-h-11 items-center bg-[var(--ink)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--paper)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
                to="/dashboard"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  className="editorial-kicker inline-flex min-h-11 items-center px-2 text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink)] sm:px-3"
                  to="/login"
                >
                  Log in
                </Link>
                <Link
                  className="editorial-kicker hidden min-h-11 items-center bg-[var(--accent)] px-4 text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent-ink)] transition hover:-translate-y-0.5 sm:inline-flex"
                  to="/register"
                >
                  Try it free
                </Link>
              </>
            )}
          </div>
        </nav>

        <nav
          aria-label="Mobile navigation"
          className="editorial-kicker flex items-center justify-center gap-8 border-t border-[var(--rule)] px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] md:hidden"
        >
          {navItems.map((item) => (
            <a className="transition hover:text-[var(--ink)]" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main className="relative z-10" id="main-content">
        <section
          className="mx-auto max-w-7xl scroll-mt-36 px-5 pb-14 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-14"
          id="home"
        >
          <div className="editorial-kicker flex flex-wrap items-center justify-between gap-3 border-b border-[var(--rule-strong)] pb-4 text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            <span className="text-[var(--accent)]">The Learning Review</span>
            <span>AI Exam Coach · Issue No. 01</span>
          </div>

          <div className="grid lg:grid-cols-12">
            <div className="editorial-reveal border-b border-[var(--rule)] py-10 lg:col-span-8 lg:border-b-0 lg:border-r lg:pb-14 lg:pr-12 lg:pt-14">
              <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                A more considered way to prepare
              </p>
              <h1 className="editorial-display mt-6 max-w-5xl text-[clamp(3.6rem,8vw,7.6rem)] font-medium leading-[0.84] tracking-[-0.055em]">
                Read your course.
                <span className="block italic text-[var(--accent)]">Reveal the gaps.</span>
                Study with intent.
              </h1>
            </div>

            <aside className="editorial-reveal editorial-delay-1 flex flex-col justify-between py-8 lg:col-span-4 lg:pb-14 lg:pl-10 lg:pt-14">
              <div>
                <p className="editorial-display text-2xl leading-9 text-[var(--muted)] sm:text-3xl sm:leading-10">
                  Your files become a personal exam coach—one that knows your syllabus,
                  your weak spots, and the time left before the exam.
                </p>
                <p className="mt-6 max-w-md text-base leading-7 text-[var(--muted)]">
                  Upload class materials, approve the topic map, take focused quizzes,
                  and receive a study plan built from the results.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link
                  className="editorial-kicker inline-flex min-h-12 items-center justify-between gap-6 bg-[var(--accent)] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-ink)] transition hover:-translate-y-1"
                  to={token ? "/dashboard" : "/register"}
                >
                  {token ? "Open dashboard" : "Start studying"}
                  <span aria-hidden="true">↗</span>
                </Link>
                <a
                  className="editorial-kicker inline-flex min-h-12 items-center justify-between gap-6 border border-[var(--rule-strong)] px-5 text-xs font-bold uppercase tracking-[0.14em] transition hover:bg-[var(--surface)]"
                  href="#about"
                >
                  Read our approach
                  <span aria-hidden="true">↓</span>
                </a>
              </div>
            </aside>
          </div>

          <article className="editorial-reveal editorial-delay-2 grid border-y border-[var(--rule-strong)] bg-[var(--surface)] lg:grid-cols-12">
            <div className="border-b border-[var(--rule)] p-6 sm:p-8 lg:col-span-3 lg:border-b-0 lg:border-r">
              <p className="editorial-kicker text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                Sample readiness
              </p>
              <p className="editorial-display mt-8 text-7xl font-medium leading-none tracking-[-0.06em] sm:text-8xl">
                82<span className="text-3xl text-[var(--accent)]">%</span>
              </p>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Diagnostic analysis complete</p>
            </div>

            <div className="border-b border-[var(--rule)] p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r">
              <p className="editorial-kicker text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                The finding
              </p>
              <h2 className="editorial-display mt-5 max-w-xl text-3xl leading-tight sm:text-4xl">
                “Elasticity needs a second reading.”
              </h2>
              <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">
                Strong graph interpretation, with a measurable gap in elasticity
                calculations and applied analysis questions.
              </p>
            </div>

            <div className="p-6 sm:p-8 lg:col-span-4">
              <p className="editorial-kicker text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                From source to study plan
              </p>
              <ol className="mt-5 divide-y divide-[var(--rule)]">
                {workflow.map((item) => (
                  <li className="grid grid-cols-[2.5rem_1fr] gap-3 py-3 first:pt-0" key={item.number}>
                    <span className="editorial-kicker text-xs text-[var(--accent)]">{item.number}</span>
                    <div>
                      <p className="font-bold">{item.title}</p>
                      <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </section>

        <section className="border-y border-[var(--rule-strong)]" aria-labelledby="why-tlearn">
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                  Why Tlearn
                </p>
                <h2
                  className="editorial-display mt-5 text-5xl leading-[0.95] tracking-[-0.04em] sm:text-6xl"
                  id="why-tlearn"
                >
                  Study what matters,
                  <span className="block italic text-[var(--muted)]">not everything at once.</span>
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-[var(--muted)] lg:col-span-5 lg:col-start-8 lg:pt-8">
                Tlearn turns a pile of disconnected study tasks into one readable sequence:
                understand the source, test the knowledge, interpret the result, then focus
                the next session.
              </p>
            </div>

            <div className="mt-14 grid border-y border-[var(--rule-strong)] md:grid-cols-3">
              {features.map((feature, index) => (
                <article
                  className={`py-8 md:px-8 ${
                    index > 0 ? "border-t border-[var(--rule)] md:border-l md:border-t-0" : ""
                  }`}
                  key={feature.title}
                >
                  <p className="editorial-kicker text-xs text-[var(--accent)]">{feature.number}</p>
                  <h3 className="editorial-display mt-12 text-3xl leading-tight">{feature.title}</h3>
                  <p className="mt-5 leading-7 text-[var(--muted)]">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-28 bg-[var(--surface)]" id="about">
          <div className="mx-auto grid max-w-7xl lg:grid-cols-12">
            <div className="border-b border-[var(--rule)] px-5 py-16 sm:px-6 lg:col-span-8 lg:border-b-0 lg:border-r lg:px-8 lg:py-24">
              <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                From the editor · About Tlearn
              </p>
              <blockquote className="editorial-display relative mt-10 max-w-4xl text-4xl leading-[1.08] tracking-[-0.025em] sm:pl-16 sm:text-6xl">
                <span
                  aria-hidden="true"
                  className="absolute -left-1 -top-7 hidden text-8xl text-[var(--warm)] sm:block"
                >
                  “
                </span>
                Exam preparation should begin with what a student is actually learning—not
                with a generic bank of questions.
              </blockquote>
            </div>

            <div className="flex flex-col justify-end px-5 py-12 sm:px-6 lg:col-span-4 lg:px-10 lg:py-24">
              <div className="h-1 w-16 bg-[var(--warm)]" />
              <p className="mt-8 text-lg leading-8 text-[var(--muted)]">
                Tlearn is an AI learning platform for microeconomics students. It reads
                course material, builds bilingual assessments, explains specific knowledge
                gaps, and turns those findings into a focused plan.
              </p>
              <p className="editorial-kicker mt-10 border-t border-[var(--rule)] pt-5 text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                English / Tiếng Việt · Evidence-based practice
              </p>
            </div>
          </div>
        </section>

        <section
          className="scroll-mt-28 border-y-8 border-[var(--warm)] px-5 py-16 sm:px-6 lg:px-8 lg:py-24"
          id="contact"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="editorial-kicker text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                Letters to Tlearn · Contact
              </p>
              <h2 className="editorial-display mt-5 max-w-4xl text-5xl leading-[0.95] tracking-[-0.04em] sm:text-7xl">
                Help shape the coach you want to study with.
              </h2>
            </div>

            <div className="lg:col-span-4">
              <p className="leading-7 text-[var(--muted)]">
                Found a bug, have a feature idea, or noticed a content issue? We read every
                message and use it to guide the next edition of Tlearn.
              </p>
              <div className="mt-7 flex flex-col gap-3">
                <Link
                  className="editorial-kicker inline-flex min-h-12 items-center justify-between bg-[var(--ink)] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--paper)] transition hover:bg-[var(--accent)] hover:text-[var(--accent-ink)]"
                  state={{ from: "/#contact" }}
                  to="/feedback"
                >
                  Send us feedback
                  <span aria-hidden="true">↗</span>
                </Link>
                {!token ? (
                  <Link
                    className="editorial-kicker inline-flex min-h-12 items-center justify-between border border-[var(--rule-strong)] px-5 text-xs font-bold uppercase tracking-[0.14em] transition hover:bg-[var(--surface)]"
                    to="/login"
                  >
                    Log in to Tlearn
                    <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-5 py-8 sm:px-6 lg:px-8">
        <div className="editorial-kicker mx-auto flex max-w-7xl flex-col gap-4 text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Tlearn · Built for focused learning</p>
          <div className="flex gap-6">
            <a className="hover:text-[var(--ink)]" href="#about">
              About us
            </a>
            <Link className="hover:text-[var(--ink)]" to="/feedback">
              Feedback
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
