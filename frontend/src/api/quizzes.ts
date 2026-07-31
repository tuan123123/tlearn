import { apiClient } from "./client"
import type {
  QuestionGenerationResponse,
  Quiz,
  QuizMetadata,
  QuizResults,
  QuizSubmitResponse,
} from "./types"

export async function generateQuestions(
  courseId: string,
  topicIds: string[],
): Promise<QuestionGenerationResponse> {
  const response = await apiClient.post<QuestionGenerationResponse>(
    `/courses/${courseId}/questions/generate`,
    {
      topic_ids: topicIds,
      questions_per_bloom: 3,
    },
  )
  return response.data
}

export async function createDiagnosticQuiz(courseId: string): Promise<Quiz> {
  const response = await apiClient.post<Quiz>(`/courses/${courseId}/quizzes/diagnostic`)
  return response.data
}

export async function listCourseQuizzes(courseId: string): Promise<QuizMetadata[]> {
  const response = await apiClient.get<QuizMetadata[]>(`/courses/${courseId}/quizzes`)
  return response.data
}

export async function getQuiz(quizId: string): Promise<Quiz> {
  const response = await apiClient.get<Quiz>(`/quizzes/${quizId}`)
  return response.data
}

export async function submitQuiz(
  quizId: string,
  answers: Array<{
    question_id: string
    student_answer: string
    time_spent_seconds: number
  }>,
): Promise<QuizSubmitResponse> {
  const response = await apiClient.post<QuizSubmitResponse>(`/quizzes/${quizId}/submit`, {
    answers,
  })
  return response.data
}

export async function getQuizResults(quizId: string): Promise<QuizResults> {
  const response = await apiClient.get<QuizResults>(`/quizzes/${quizId}/results`)
  return response.data
}
