import { Link } from "react-router-dom"

import { useAuthStore } from "../store/authStore"

const demoSteps = [
  "Upload microeconomics PDFs or slides",
  "Review the AI topic map before a quiz starts",
  "Take diagnostic and mock exams",
  "See weakness reports and study plans",
]

const features = [
  {
    title: "Course-aware AI",
    text: "The app reads your own class material, maps it to core microeconomics topics, and keeps evidence from the source.",
  },
  {
    title: "Bilingual studying",
    text: "English and Vietnamese learners can study in the language that fits their course materials.",
  },
  {
    title: "Weakness reports",
    text: "After a quiz, students see exactly which topic, skill, and Bloom level needs more practice.",
  },
]

function LandingPage() {
  const token = useAuthStore((state) => state.token)

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <nav className="relative z-10 flex items-center justify-between">
          <Link className="text-lg font-black tracking-tight" to="/landing">
            Tlearn
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link className="hidden text-slate-300 hover:text-white sm:inline" to="/feedback">
              Send feedback
            </Link>
            {token ? (
              <Link
                className="rounded-full bg-white px-4 py-2 font-bold text-slate-950"
                to="/"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="text-slate-300 hover:text-white" to="/login">
                  Log in
                </Link>
                <Link
                  className="rounded-full bg-emerald-400 px-4 py-2 font-bold text-slate-950 shadow-lg shadow-emerald-400/20"
                  to="/register"
                >
                  Try it free
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="relative z-10 grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div>
            <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-200">
              Microeconomics AI Exam Coach
            </p>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Turn messy course files into a personal exam coach.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Tlearn helps students upload class materials, generate quizzes, find weak
              spots, and follow a study guide built around their actual exam timeline.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="rounded-2xl bg-emerald-400 px-6 py-4 text-center font-black text-slate-950 shadow-xl shadow-emerald-400/20"
                to="/register"
              >
                Start studying
              </Link>
              <Link
                className="rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-center font-bold text-white backdrop-blur hover:bg-white/15"
                to="/feedback"
              >
                Leave feedback
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-4 shadow-2xl shadow-emerald-950/40 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-900 p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">Live demo flow</p>
                  <h2 className="text-2xl font-black">Exam readiness</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-200">
                  82%
                </span>
              </div>

              <div className="mt-5 space-y-3">
                {demoSteps.map((step, index) => (
                  <div
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                    key={step}
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-400 font-black text-slate-950">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-100">{step}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-gradient-to-br from-purple-400/20 to-emerald-400/20 p-4">
                <p className="text-sm font-bold text-emerald-100">Sample insight</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  You are strong at supply and demand graphs, but need more practice with
                  elasticity calculations and applied analysis questions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <article
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              key={feature.title}
            >
              <h3 className="text-xl font-black">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default LandingPage
