import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

export const getDashboard = async () => {
  const response = await apiClient.get(API_ENDPOINTS.REPORT.DASHBOARD)
  return response.data
}

export const getDetailedReport = async (reportType, timeRange) => {
  const params = {}
  if (timeRange) {
    params.time_range = timeRange
  }
  const response = await apiClient.get(API_ENDPOINTS.REPORT.DETAILED(reportType), { params })
  return response.data
}

export const requestExport = async (reportType, timeRange) => {
  const response = await apiClient.post(API_ENDPOINTS.REPORT.EXPORT, { reportType, timeRange })
  return response.data
}

export const getExportStatus = async (exportId) => {
  const response = await apiClient.get(API_ENDPOINTS.REPORT.EXPORT_STATUS(exportId))
  return response.data
}

export const downloadExport = async (exportId) => {
  const response = await apiClient.get(API_ENDPOINTS.REPORT.EXPORT_DOWNLOAD(exportId), {
    responseType: 'blob',
  })
  return response.data
}

export const retryExport = async (exportId) => {
  const response = await apiClient.post(API_ENDPOINTS.REPORT.EXPORT_RETRY(exportId))
  return response.data
}
