import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { submitFeedback } from "../api/feedback"
import type { FeedbackCategory, FeedbackCreateRequest } from "../api/types"
import type { Language } from "../i18n"

interface FeedbackFormProps {
  language: Language
  pageContext: string
  compact?: boolean
  onSuccess?: () => void
}

interface FeedbackFormValues {
  category: FeedbackCategory
  message: string
  rating_text: string
}

const feedbackFormText = {
  en: {
    category: "Category",
    bug: "Bug report",
    feature_request: "Feature request",
    content_issue: "Content issue",
    general: "General",
    message: "Message",
    messagePlaceholder: "What happened? What should improve?",
    characters: "characters",
    rating: "Rating",
    noRating: "No rating",
    submit: "Send feedback",
    sending: "Sending...",
    thanks: "Thanks — we read every one of these.",
    rateLimit: "You've submitted a few of these recently — give it an hour.",
    error: "Sorry, feedback could not be sent. Please try again.",
    context: "Page context",
  },
  vi: {
    category: "Loại góp ý",
    bug: "Báo lỗi",
    feature_request: "Đề xuất tính năng",
    content_issue: "Vấn đề nội dung",
    general: "Góp ý chung",
    message: "Nội dung",
    messagePlaceholder: "Điều gì đã xảy ra? Bạn muốn cải thiện gì?",
    characters: "ký tự",
    rating: "Đánh giá",
    noRating: "Không đánh giá",
    submit: "Gửi góp ý",
    sending: "Đang gửi...",
    thanks: "Cảm ơn bạn — tụi mình đọc từng góp ý.",
    rateLimit: "Bạn đã gửi vài góp ý gần đây — hãy thử lại sau khoảng một giờ.",
    error: "Xin lỗi, chưa gửi được góp ý. Hãy thử lại.",
    context: "Trang gửi góp ý",
  },
}

function FeedbackForm({ language, pageContext, compact = false, onSuccess }: FeedbackFormProps) {
  const text = feedbackFormText[language]
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    defaultValues: {
      category: "general",
      message: "",
      rating_text: "",
    },
  })

  const category = watch("category")
  const message = watch("message") ?? ""
  const messageLength = message.trim().length
  const canSubmit = messageLength >= 10

  const feedback = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      reset({ category: "general", message: "", rating_text: "" })
      onSuccess?.()
    },
  })

  function onSubmit(values: FeedbackFormValues) {
    const payload: FeedbackCreateRequest = {
      category: values.category,
      message: values.message,
      page_context: pageContext,
    }

    if (values.category === "general" && values.rating_text) {
      payload.rating = Number(values.rating_text)
    }

    feedback.mutate(payload)
  }

  if (feedback.isSuccess) {
    return (
      <div className="rounded-3xl bg-emerald-50 p-6 text-center">
        <p className="text-lg font-black text-emerald-900">{text.thanks}</p>
      </div>
    )
  }

  const statusCode = getStatusCode(feedback.error)

  return (
    <form className={compact ? "space-y-4" : "space-y-5"} onSubmit={handleSubmit(onSubmit)}>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">{text.category}</span>
        <select
          className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
          {...register("category", { required: true })}
        >
          <option value="bug">{text.bug}</option>
          <option value="feature_request">{text.feature_request}</option>
          <option value="content_issue">{text.content_issue}</option>
          <option value="general">{text.general}</option>
        </select>
      </label>

      <label className="block">
        <span className="text-sm font-bold text-slate-700">{text.message}</span>
        <textarea
          className="mt-2 min-h-36 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
          placeholder={text.messagePlaceholder}
          {...register("message", {
            required: true,
            minLength: 10,
            maxLength: 2000,
          })}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className={errors.message ? "text-red-700" : "text-slate-500"}>
            {messageLength} / 2000 {text.characters}
          </span>
          <span className="text-slate-400">{pageContext}</span>
        </div>
      </label>

      {category === "general" ? (
        <label className="block">
          <span className="text-sm font-bold text-slate-700">{text.rating}</span>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500"
            {...register("rating_text")}
          >
            <option value="">{text.noRating}</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>
          </select>
        </label>
      ) : null}

      {feedback.isError ? (
        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {statusCode === 429 ? text.rateLimit : text.error}
        </p>
      ) : null}

      <button
        className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white shadow-xl shadow-slate-900/20 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!canSubmit || feedback.isPending}
        type="submit"
      >
        {feedback.isPending ? text.sending : text.submit}
      </button>
    </form>
  )
}

function getStatusCode(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return undefined
  }

  return (error as { response?: { status?: number } }).response?.status
}

export default FeedbackForm
