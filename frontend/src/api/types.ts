export interface User {
  id: string
  email: string
  display_name: string
  location_country: string
  language: string
  role: string
  created_at: string
}

export interface AuthResponse {
  access_token: string
  token_type: "bearer"
  user: User
}

export interface Course {
  id: string
  user_id: string
  name: string
  university: string
  language: string
  exam_date: string
  days_until_exam: number
  uploaded_file_count: number
  created_at: string
}

export interface CreateCourseRequest {
  name: string
  university: string
  language: string
  exam_date: string
}

export type FeedbackCategory = "bug" | "feature_request" | "content_issue" | "general"

export interface FeedbackCreateRequest {
  category: FeedbackCategory
  message: string
  rating?: number
  page_context: string
}

export interface FeedbackCreateResponse {
  success: boolean
  feedback_id: string
}

export type ExtractionStatus = "pending" | "processing" | "done" | "failed"

export interface PageRef {
  page: number
  text: string
}

export interface UploadCreateResponse {
  file_id: string
  original_filename: string
  extraction_status: ExtractionStatus
}

export interface UploadedFileListItem {
  id: string
  course_id: string
  original_filename: string
  file_type: "pdf" | "pptx"
  file_size_bytes: number
  extraction_status: ExtractionStatus
  extraction_error: string | null
  uploaded_at: string
  extracted_at: string | null
}

export interface UploadedFile extends UploadedFileListItem {
  user_id: string
  storage_path: string
  extracted_text: string | null
  page_refs: PageRef[]
}

export type TopicName =
  | "Supply and Demand"
  | "Price Elasticity"
  | "Income and Cross Elasticity"
  | "Consumer Theory"
  | "Production and Costs"
  | "Perfect Competition"
  | "Monopoly"
  | "Oligopoly"
  | "Game Theory"
  | "Market Failure and Externalities"
  | "Public Goods"
  | "Labour Markets"
  | "International Trade"

export interface Topic {
  id: string
  course_id: string
  user_id: string
  name: TopicName
  description: string
  bloom_skills: string[]
  source_evidence: string
  is_custom: boolean
  is_approved: boolean
  created_at: string
}

export interface TopicCreateRequest {
  name: TopicName
  description: string
  bloom_skills: string[]
}

export interface TopicUpdateRequest {
  name?: TopicName
  description?: string
  bloom_skills?: string[]
  is_approved?: boolean
}

export interface TopicExtractionResponse {
  topics: Topic[]
  extracted_count: number
}

export type QuestionType = "mcq" | "short_answer" | "numeric"

export interface Question {
  id: string
  course_id: string
  topic_id: string
  topic_name: string
  skill: string
  bloom_level: number
  bloom_label: string
  question_type: QuestionType
  question_text: string
  options: string[] | null
  source_ref: string
  difficulty: "easy" | "medium" | "hard"
  created_at: string
}

export interface QuestionResult extends Question {
  correct_answer: string
  explanation: string
}

export interface QuestionGenerationResponse {
  generated: number
  rejected: number
  questions: QuestionResult[]
}

export interface Quiz {
  id: string
  course_id: string
  quiz_type: "diagnostic" | "practice"
  question_ids: string[]
  bloom_distribution: Record<string, number>
  status: "active" | "submitted"
  created_at: string
  submitted_at: string | null
  questions: Question[]
}

export interface QuizMetadata {
  id: string
  course_id: string
  quiz_type: "diagnostic" | "practice"
  status: "active" | "submitted"
  created_at: string
  submitted_at: string | null
}

export interface QuizSubmitResponse {
  quiz_id: string
  total_score: number
  correct_count: number
  total_questions: number
}

export interface Attempt {
  id: string
  quiz_id: string
  question_id: string
  course_id: string
  topic_id: string
  topic_name: string
  bloom_level: number
  bloom_label: string
  skill: string
  student_answer: string
  is_correct: boolean
  score: number
  time_spent_seconds: number
  used_hint: boolean
  grading_method: "code" | "ai"
  ai_feedback: string | null
  created_at: string
}

export interface TopicScore {
  accuracy: number
  avg_time: number
  question_count: number
  weakness_score: number
}

export interface BloomScore {
  bloom_label: string
  accuracy: number
  question_count: number
}

export interface SkillScore {
  accuracy: number
  topic_name: string
  bloom_level: number
  question_count: number
}

export interface WeakTopic extends TopicScore {
  topic_name: string
}

export interface WeakBloomLevel extends BloomScore {
  bloom_level: number
}

export interface WeakSkill extends SkillScore {
  skill: string
}

export interface WeaknessReport {
  topic_scores: Record<string, TopicScore>
  bloom_scores: Record<string, BloomScore>
  skill_scores: Record<string, SkillScore>
  weak_topics: WeakTopic[]
  weak_bloom_levels: WeakBloomLevel[]
  weakest_skills: WeakSkill[]
  weakness_summary: string
  computed_at: string
}

export interface QuizResults {
  quiz: Quiz
  questions: QuestionResult[]
  attempts: Attempt[]
  weakness_report: WeaknessReport
  total_score: number
  correct_count: number
  total_questions: number
}

export type TimeBand = "14+" | "7-13" | "3-6" | "1-2" | "exam_day"

export interface DayPlan {
  day_number: number
  date_label: string
  focus_topics: string[]
  bloom_focus: string[]
  activities: string[]
  estimated_hours: number
  practice_question_count: number
}

export interface StudyGuide {
  id: string
  course_id: string
  user_id: string
  version: number
  trigger: string
  exam_date: string
  days_until_exam: number
  time_band: TimeBand
  weak_topics_input: WeakTopic[]
  bloom_gaps_input: WeakBloomLevel[]
  plan: DayPlan[]
  generated_at: string
}

export interface StudyGuideMetadata {
  id: string
  course_id: string
  version: number
  trigger: string
  exam_date: string
  days_until_exam: number
  time_band: TimeBand
  generated_at: string
}

export type MockTrend = "improving" | "stagnant" | "declining" | "first_mock"

export interface MockExam {
  id: string
  course_id: string
  mock_number: number
  time_band: TimeBand
  days_until_exam: number
  question_count: number
  duration_minutes: number | null
  question_ids: string[]
  weak_topic_boost: Record<string, number>
  bloom_distribution: Record<string, number>
  status: "active" | "submitted"
  created_at: string
  submitted_at: string | null
  questions: Question[]
}

export interface MockExamGenerateResponse {
  mode: "mock_exam" | "exam_day"
  mock_exam: MockExam | null
  checklist: string[]
}

export interface MockExamListItem {
  id: string
  course_id: string
  mock_number: number
  time_band: TimeBand
  question_count: number
  duration_minutes: number | null
  status: "active" | "submitted"
  created_at: string
  submitted_at: string | null
  latest_score: number | null
  trend: MockTrend | null
  vs_diagnostic: number | null
}

export interface MockExamSubmitResponse {
  mock_exam_attempt_id: string
  total_score: number
  trend: MockTrend
  vs_diagnostic: number | null
  vs_previous_mock: number | null
  study_guide_id: string | null
  study_guide_version: number | null
}

export interface MockExamAnswer {
  question_id: string
  student_answer: string
  is_correct: boolean
  score: number
  time_spent_seconds: number
}

export interface MockExamAttempt {
  id: string
  mock_exam_id: string
  course_id: string
  mock_number: number
  total_score: number
  correct_count: number
  topic_scores: Record<string, { accuracy: number; question_count: number }>
  bloom_scores: Record<string, number>
  vs_diagnostic: number | null
  vs_previous_mock: number | null
  answers: MockExamAnswer[]
  trend: MockTrend
  study_guide_id: string | null
  study_guide_version: number | null
  created_at: string
}

export interface MockExamResults {
  mock_exam: MockExam
  attempt: MockExamAttempt
  questions: QuestionResult[]
  diagnostic_topic_scores: Record<string, { accuracy: number; question_count: number }>
  diagnostic_bloom_scores: Record<string, number>
}

export interface ScoreHistoryEvent {
  id: string
  course_id: string
  user_id: string
  event_type: "diagnostic" | "mock"
  event_id: string
  event_number: number
  total_score: number
  topic_scores: Record<string, number>
  bloom_scores: Record<string, number>
  days_until_exam: number
  recorded_at: string
}

export interface Readiness {
  readiness_score: number
  status: "on_track" | "at_risk" | "critical"
  trend: "improving" | "stagnant" | "declining" | "insufficient_data"
  topic_readiness: Record<string, number>
  bloom_readiness: Record<string, number>
  last_event_date: string | null
  events_completed: {
    diagnostic: boolean
    mocks: number
  }
}

export interface TopicProgress {
  topic_name: string
  diagnostic_accuracy: number | null
  latest_mock_accuracy: number | null
  change: number | null
  trend: "improving" | "stagnant" | "declining" | "insufficient_data"
}

export interface BloomTrend {
  bloom_level: number
  points: Array<{
    event_number: number
    event_type: "diagnostic" | "mock"
    accuracy: number
  }>
}
