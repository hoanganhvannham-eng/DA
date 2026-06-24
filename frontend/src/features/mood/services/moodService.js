import apiClient from '../../../shared/services/apiClient'

const BASE_URL = '/v1/moods'

export const getPublicMoods = async () => {
  const response = await apiClient.get(`${BASE_URL}/public`)
  return response.data
}

export const getMoods = async () => {
  const response = await apiClient.get(BASE_URL)
  return response.data
}

export const createMood = async (data) => {
  const response = await apiClient.post(BASE_URL, data)
  return response.data
}

export const updateMood = async (id, data) => {
  const response = await apiClient.put(`${BASE_URL}/${id}`, data)
  return response.data
}

export const deleteMood = async (id) => {
  const response = await apiClient.delete(`${BASE_URL}/${id}`)
  return response.data
}
