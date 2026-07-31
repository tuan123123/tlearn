import { apiClient } from "./client"
import type { Course, CreateCourseRequest } from "./types"

export async function listCourses(): Promise<Course[]> {
  const response = await apiClient.get<Course[]>("/courses")
  return response.data
}

export async function getCourse(courseId: string): Promise<Course> {
  const response = await apiClient.get<Course>(`/courses/${courseId}`)
  return response.data
}

export async function createCourse(payload: CreateCourseRequest): Promise<Course> {
  const response = await apiClient.post<Course>("/courses", payload)
  return response.data
}
