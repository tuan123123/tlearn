import { useParams } from "react-router-dom"

import BloomTrendFullChart from "../components/BloomTrendFullChart"
import HistoryTimeline from "../components/HistoryTimeline"
import PageBackActions from "../components/PageBackActions"
import ReadinessGauge from "../components/ReadinessGauge"
import ScoreProgressChart from "../components/ScoreProgressChart"
import TopicProgressCard from "../components/TopicProgressCard"
import { useBloomTrend, useReadiness, useScoreHistory, useTopicProgress } from "../hooks/useProgress"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

function ProgressPage() {
  const { courseId } = useParams()
  const user = useAuthStore((state) => state.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const readiness = useReadiness(courseId ?? "")
  const history = useScoreHistory(courseId ?? "")
  const topicProgress = useTopicProgress(courseId ?? "")
  const bloomTrend = useBloomTrend(courseId ?? "")

  if (!courseId) {
    return <main className="p-6 text-red-700">Missing course id.</main>
  }

  if (readiness.isLoading || history.isLoading || topicProgress.isLoading || bloomTrend.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingResults}</main>
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <PageBackActions />

      <header className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.progress}
        </p>
        <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-950">
              {text.viewProgress}
            </h1>
            <p className="mt-3 text-slate-600">
              {text.readiness}: {readiness.data?.trend ?? text.insufficientData}
            </p>
          </div>
          <ReadinessGauge language={language} readiness={readiness.data} />
        </div>
      </header>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-950">{text.score}</h2>
        <ScoreProgressChart history={history.data ?? []} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-950">{text.topicScores}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {topicProgress.data?.map((progress) => (
            <TopicProgressCard
              key={progress.topic_name}
              language={language}
              progress={progress}
            />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-950">{text.bloomRadar}</h2>
        <BloomTrendFullChart bloomTrend={bloomTrend.data ?? []} history={history.data ?? []} />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold text-slate-950">{text.studyTimeline}</h2>
        <HistoryTimeline history={history.data ?? []} language={language} />
      </section>
    </main>
  )
}

export default ProgressPage
