import { useEffect, useState } from "react"
import { useLocation, useParams } from "react-router-dom"

import DayPlanCard from "../components/DayPlanCard"
import GuideVersionSelector from "../components/GuideVersionSelector"
import PageBackActions from "../components/PageBackActions"
import WeakTopicSummary from "../components/WeakTopicSummary"
import { useLatestStudyGuide, useStudyGuide, useStudyGuideVersions } from "../hooks/useStudyGuides"
import { languageFromUser, uiText } from "../i18n"
import { useAuthStore } from "../store/authStore"

interface StudyGuideLocationState {
  generatedVersion?: number
}

function StudyGuidePage() {
  const { courseId } = useParams()
  const location = useLocation()
  const state = location.state as StudyGuideLocationState | null
  const user = useAuthStore((store) => store.user)
  const language = languageFromUser(user?.language)
  const text = uiText[language]
  const latestGuide = useLatestStudyGuide(courseId ?? "")
  const versions = useStudyGuideVersions(courseId ?? "")
  const [selectedGuideId, setSelectedGuideId] = useState("")
  const selectedGuide = useStudyGuide(selectedGuideId)

  useEffect(() => {
    if (!selectedGuideId && latestGuide.data?.id) {
      setSelectedGuideId(latestGuide.data.id)
    }
  }, [latestGuide.data?.id, selectedGuideId])

  if (!courseId) {
    return <main className="p-6 text-red-700">Missing course id.</main>
  }

  if (latestGuide.isLoading || versions.isLoading) {
    return <main className="p-6 text-slate-600">{text.loadingResults}</main>
  }

  if (latestGuide.isError || !latestGuide.data) {
    return (
      <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
        <PageBackActions />
        <section className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h1 className="text-3xl font-bold text-slate-950">{text.studyGuideTitle}</h1>
          <p className="mt-3 text-slate-600">{text.latestGuideMissing}</p>
        </section>
      </main>
    )
  }

  const guide = selectedGuide.data ?? latestGuide.data

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <PageBackActions />

      {state?.generatedVersion ? (
        <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          {text.studyGuideReady} v{state.generatedVersion} {text.studyGuideReadyToast}
        </div>
      ) : null}

      <header className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          {text.studyGuideReady} v{guide.version}
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          {text.studyGuideTitle}
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          {text.studyGuideSubtitle}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <GuideVersionSelector
            language={language}
            selectedGuideId={selectedGuideId || latestGuide.data.id}
            versions={versions.data ?? []}
            onChange={setSelectedGuideId}
          />
          <WeakTopicSummary language={language} weakTopics={guide.weak_topics_input} />
        </div>

        <section>
          <h2 className="text-2xl font-bold text-slate-950">{text.studyTimeline}</h2>
          <div className="mt-4 space-y-5 border-l-4 border-emerald-100 pl-5">
            {guide.plan.map((day) => (
              <DayPlanCard day={day} key={day.day_number} language={language} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default StudyGuidePage
