import type { StudyGuideMetadata } from "../api/types"
import type { Language } from "../i18n"
import { uiText } from "../i18n"

interface GuideVersionSelectorProps {
  versions: StudyGuideMetadata[]
  selectedGuideId: string
  language: Language
  onChange: (guideId: string) => void
}

function GuideVersionSelector({
  versions,
  selectedGuideId,
  language,
  onChange,
}: GuideVersionSelectorProps) {
  const text = uiText[language]
  const selectedVersion = versions.find((version) => version.id === selectedGuideId)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{text.version}</span>
        <select
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2"
          value={selectedGuideId}
          onChange={(event) => onChange(event.target.value)}
        >
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {text.version} {version.version} ({text.after} {version.trigger})
            </option>
          ))}
        </select>
      </label>
      {selectedVersion ? (
        <p className="mt-2 text-xs text-slate-500">
          {text.generated}: {new Date(selectedVersion.generated_at).toLocaleString()}
        </p>
      ) : null}
    </div>
  )
}

export default GuideVersionSelector
