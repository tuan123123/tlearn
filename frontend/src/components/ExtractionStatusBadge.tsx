import type { ExtractionStatus } from "../api/types"

interface ExtractionStatusBadgeProps {
  status: ExtractionStatus
}

const badgeStyles = {
  pending: "bg-slate-100 text-slate-700",
  processing: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-700",
}

const badgeLabels = {
  pending: "Waiting...",
  processing: "Extracting text...",
  done: "Ready",
  failed: "Extraction failed",
}

function ExtractionStatusBadge({ status }: ExtractionStatusBadgeProps) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${badgeStyles[status]}`}>
      {badgeLabels[status]}
    </span>
  )
}

export default ExtractionStatusBadge
