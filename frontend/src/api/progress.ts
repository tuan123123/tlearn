import { apiClient } from "./client"
import type { BloomTrend, Readiness, ScoreHistoryEvent, TopicProgress } from "./types"

export async function getScoreHistory(courseId: string): Promise<ScoreHistoryEvent[]> {
  const response = await apiClient.get<ScoreHistoryEvent[]>(`/courses/${courseId}/score-history`)
  return response.data
}

export async function getReadiness(courseId: string): Promise<Readiness> {
  const response = await apiClient.get<Readiness>(`/courses/${courseId}/readiness`)
  return response.data
}

export async function getTopicProgress(courseId: string): Promise<TopicProgress[]> {
  const response = await apiClient.get<TopicProgress[]>(`/courses/${courseId}/progress/topics`)
  return response.data
}

export async function getBloomTrend(courseId: string): Promise<BloomTrend[]> {
  const response = await apiClient.get<BloomTrend[]>(`/courses/${courseId}/progress/bloom-trend`)
  return response.data
}
