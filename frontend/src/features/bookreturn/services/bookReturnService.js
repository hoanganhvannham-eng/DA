import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

export const createReturnRequest = async (data) => {
  const response = await apiClient.post(API_ENDPOINTS.BOOK_RETURN.REQUEST, data)
  return response.data
}

export const getPendingReturns = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.BOOK_RETURN.PENDING, { params })
  return response.data
}

export const confirmReturn = async (borrowId, data) => {
  const url = API_ENDPOINTS.BOOK_RETURN.CONFIRM.replace(':borrowId', borrowId)
  const response = await apiClient.post(url, data)
  return response.data
}

export const bulkConfirmReturn = async (data) => {
  const response = await apiClient.post(API_ENDPOINTS.BOOK_RETURN.BULK_CONFIRM, data)
  return response.data
}

export const getFineLevels = async (type) => {
  const params = type ? { type } : {}
  const response = await apiClient.get(API_ENDPOINTS.FINE.LEVELS, { params })
  return response.data
}

export const getReturnRequestedBorrows = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.BOOK_RETURN.RETURN_REQUESTED, { params })
  return response.data
}

export const getReturnShippingIssues = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.BOOK_RETURN.RETURN_ISSUES, { params })
  return response.data
}

export const createReturnShipment = async (borrowId) => {
  const url = API_ENDPOINTS.BOOK_RETURN.CREATE_SHIPMENT.replace(':borrowId', borrowId)
  const response = await apiClient.post(url)
  return response.data
}

export const retryReturnShipping = async (borrowId) => {
  const url = API_ENDPOINTS.BOOK_RETURN.RETRY_RETURN.replace(':borrowId', borrowId)
  await apiClient.post(url)
}

export const resolveReturnLost = async (borrowId, data) => {
  const url = API_ENDPOINTS.BOOK_RETURN.RESOLVE_LOST.replace(':borrowId', borrowId)
  const response = await apiClient.post(url, data)
  return response.data
}
