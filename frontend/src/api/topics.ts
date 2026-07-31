import { apiClient } from "./client"
import type {
  Topic,
  TopicCreateRequest,
  TopicExtractionResponse,
  TopicUpdateRequest,
} from "./types"

export async function extractTopics(courseId: string): Promise<TopicExtractionResponse> {
  const response = await apiClient.post<TopicExtractionResponse>(
    `/courses/${courseId}/extract-topics`,
  )
  return response.data
}

export async function listTopics(courseId: string): Promise<Topic[]> {
  const response = await apiClient.get<Topic[]>(`/courses/${courseId}/topics`)
  return response.data
}

export async function createTopic(
  courseId: string,
  payload: TopicCreateRequest,
): Promise<Topic> {
  const response = await apiClient.post<Topic>(`/courses/${courseId}/topics`, payload)
  return response.data
}

export async function updateTopic(
  topicId: string,
  payload: TopicUpdateRequest,
): Promise<Topic> {
  const response = await apiClient.patch<Topic>(`/topics/${topicId}`, payload)
  return response.data
}

export async function deleteTopic(topicId: string): Promise<void> {
  await apiClient.delete(`/topics/${topicId}`)
}
