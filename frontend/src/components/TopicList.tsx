import { useState } from "react"
import { Link } from "react-router-dom"

import type { Topic } from "../api/types"
import type { Language } from "../i18n"
import { topicNames, uiText } from "../i18n"
import {
  useCreateTopic,
  useDeleteTopic,
  useExtractTopics,
  useTopics,
  useUpdateTopic,
} from "../hooks/useTopics"
import EditTopicModal from "./EditTopicModal"

interface TopicListProps {
  courseId: string
  language: Language
}

function TopicList({ courseId, language }: TopicListProps) {
  const text = uiText[language]
  const topics = useTopics(courseId)
  const extractTopics = useExtractTopics(courseId)
  const createTopic = useCreateTopic(courseId)
  const updateTopic = useUpdateTopic(courseId)
  const deleteTopic = useDeleteTopic(courseId)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [isAddingTopic, setIsAddingTopic] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)

  const topicList = topics.data ?? []
  const approvedCount = topicList.filter((topic) => topic.is_approved).length
  const canConfirm = approvedCount >= 3
  const readyForDiagnostic =
    isConfirmed ||
    (topicList.length >= 3 && topicList.every((topic) => topic.is_approved))

  async function confirmAllTopics() {
    await Promise.all(
      topicList.map((topic) =>
        updateTopic.mutateAsync({
          topicId: topic.id,
          payload: { is_approved: true },
        }),
      ),
    )
    setIsConfirmed(true)
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{text.topicReview}</h2>
          <p className="mt-1 text-sm text-slate-600">{text.approvalHint}</p>
        </div>
        <button
          className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white disabled:bg-slate-300"
          disabled={extractTopics.isPending}
          type="button"
          onClick={() => extractTopics.mutate()}
        >
          {extractTopics.isPending ? text.extracting : text.extractTopics}
        </button>
      </div>

      {extractTopics.isError ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not extract topics. Check your OpenAI API key and extracted files.
        </p>
      ) : null}

      {topics.isLoading ? (
        <p className="mt-5 text-sm text-slate-600">Loading topics...</p>
      ) : null}

      <div className="mt-5 space-y-4">
        {topicList.map((topic) => (
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={topic.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-950">
                  {topicNames[topic.name][language]}
                </h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {topic.name}
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input
                  checked={topic.is_approved}
                  type="checkbox"
                  onChange={(event) =>
                    updateTopic.mutate({
                      topicId: topic.id,
                      payload: { is_approved: event.target.checked },
                    })
                  }
                />
                Approve
              </label>
            </div>

            <p className="mt-3 text-slate-700">{topic.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {topic.bloom_skills.map((skill) => (
                <span
                  className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800"
                  key={skill}
                >
                  {skill}
                </span>
              ))}
            </div>
            <blockquote className="mt-4 rounded-xl border-l-4 border-emerald-600 bg-white p-4 text-sm text-slate-600">
              “{topic.source_evidence}”
            </blockquote>

            <div className="mt-4 flex gap-3">
              <button
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700"
                type="button"
                onClick={() => setEditingTopic(topic)}
              >
                Edit
              </button>
              <button
                className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-700"
                type="button"
                onClick={() => deleteTopic.mutate(topic.id)}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
          type="button"
          onClick={() => setIsAddingTopic(true)}
        >
          {text.addCustomTopic}
        </button>
        <button
          className="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white disabled:bg-slate-300"
          disabled={!canConfirm}
          type="button"
          onClick={confirmAllTopics}
        >
          {text.confirmAll} ({approvedCount}/3)
        </button>
      </div>

      {readyForDiagnostic ? (
        <Link
          className="mt-5 inline-flex rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white"
          to={`/courses/${courseId}/diagnostic`}
        >
          {text.diagnosticReady}
        </Link>
      ) : null}

      {(editingTopic || isAddingTopic) ? (
        <EditTopicModal
          isSaving={createTopic.isPending || updateTopic.isPending}
          language={language}
          topic={editingTopic}
          onClose={() => {
            setEditingTopic(null)
            setIsAddingTopic(false)
          }}
          onSave={(payload) => {
            if (editingTopic) {
              updateTopic.mutate(
                { topicId: editingTopic.id, payload },
                { onSuccess: () => setEditingTopic(null) },
              )
              return
            }
            createTopic.mutate(payload, { onSuccess: () => setIsAddingTopic(false) })
          }}
        />
      ) : null}
    </section>
  )
}

export default TopicList
