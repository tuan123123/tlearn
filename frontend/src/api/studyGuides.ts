import { apiClient } from "./client"
import type { StudyGuide, StudyGuideMetadata } from "./types"

export async function generateStudyGuide(
  courseId: string,
  quizId: string,
): Promise<StudyGuide> {
  const response = await apiClient.post<StudyGuide>(
    `/courses/${courseId}/study-guide/generate`,
    { quiz_id: quizId },
  )
  return response.data
}

export async function getLatestStudyGuide(courseId: string): Promise<StudyGuide> {
  const response = await apiClient.get<StudyGuide>(`/courses/${courseId}/study-guide/latest`)
  return response.data
}

export async function listStudyGuides(courseId: string): Promise<StudyGuideMetadata[]> {
  const response = await apiClient.get<StudyGuideMetadata[]>(`/courses/${courseId}/study-guides`)
  return response.data
}

export async function getStudyGuide(guideId: string): Promise<StudyGuide> {
  const response = await apiClient.get<StudyGuide>(`/study-guides/${guideId}`)
  return response.data
}
