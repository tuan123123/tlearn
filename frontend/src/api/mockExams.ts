import { apiClient } from "./client"
import type {
  MockExam,
  MockExamGenerateResponse,
  MockExamListItem,
  MockExamResults,
  MockExamSubmitResponse,
} from "./types"

export async function generateMockExam(courseId: string): Promise<MockExamGenerateResponse> {
  const response = await apiClient.post<MockExamGenerateResponse>(
    `/courses/${courseId}/mock-exams/generate`,
  )
  return response.data
}

export async function listMockExams(courseId: string): Promise<MockExamListItem[]> {
  const response = await apiClient.get<MockExamListItem[]>(`/courses/${courseId}/mock-exams`)
  return response.data
}

export async function getMockExam(mockExamId: string): Promise<MockExam> {
  const response = await apiClient.get<MockExam>(`/mock-exams/${mockExamId}`)
  return response.data
}

export async function submitMockExam(
  mockExamId: string,
  answers: Array<{
    question_id: string
    student_answer: string
    time_spent_seconds: number
  }>,
): Promise<MockExamSubmitResponse> {
  const response = await apiClient.post<MockExamSubmitResponse>(
    `/mock-exams/${mockExamId}/submit`,
    { answers },
  )
  return response.data
}

export async function getMockExamResults(mockExamId: string): Promise<MockExamResults> {
  const response = await apiClient.get<MockExamResults>(`/mock-exams/${mockExamId}/results`)
  return response.data
}
