import { FormEvent, useEffect, useState } from "react"

import type { Language } from "../i18n"
import { topicNames, topicTemplate, topicVietnameseHints } from "../i18n"
import type { Topic, TopicCreateRequest, TopicName } from "../api/types"

interface EditTopicModalProps {
  language: Language
  topic: Topic | null
  onClose: () => void
  onSave: (payload: TopicCreateRequest) => void
  isSaving: boolean
}

function EditTopicModal({
  language,
  topic,
  onClose,
  onSave,
  isSaving,
}: EditTopicModalProps) {
  const [name, setName] = useState<TopicName>("Supply and Demand")
  const [description, setDescription] = useState("")
  const [skills, setSkills] = useState("")

  useEffect(() => {
    setName(topic?.name ?? "Supply and Demand")
    setDescription(topic?.description ?? "")
    setSkills(topic?.bloom_skills.join(", ") ?? "")
  }, [topic])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({
      name,
      description,
      bloom_skills: skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    })
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-950/40 px-4">
      <form
        className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-slate-950">
          {topic ? "Edit topic" : "Add custom topic"}
        </h2>

        <label className="mt-5 block">
          <span className="text-sm font-medium text-slate-700">Topic</span>
          <select
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={name}
            onChange={(event) => setName(event.target.value as TopicName)}
          >
            {topicTemplate.map((topicName) => (
              <option key={topicName} value={topicName}>
                {topicNames[topicName][language]} ({topicNames[topicName].en})
              </option>
            ))}
          </select>
        </label>

        {language === "vi" ? (
          <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            <p className="font-bold">Từ khóa tiếng Việt thường gặp</p>
            <p className="mt-1">{topicVietnameseHints[name].join(", ")}</p>
          </div>
        ) : null}

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium text-slate-700">
            Bloom skills, comma separated
          </span>
          <input
            className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="identify, explain, calculate"
          />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold text-slate-700"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditTopicModal
