import apiClient from '../../../shared/services/apiClient'
import { API_ENDPOINTS } from '../../../shared/constants/apiEndpoints'

export const getWallet = async () => {
  const response = await apiClient.get(API_ENDPOINTS.WALLET.GET)
  return response.data
}

export const getTransactions = async ({ page = 0, size = 10 } = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.WALLET.TRANSACTIONS, {
    params: { page, size },
  })
  return response.data
}

export const topUpAtCounter = async (amount, description) => {
  const response = await apiClient.post(API_ENDPOINTS.WALLET.TOP_UP, {
    amount,
    description,
  })
  return response.data
}

export const withdrawAtCounter = async (amount, description) => {
  const response = await apiClient.post(API_ENDPOINTS.WALLET.WITHDRAW, {
    amount,
    description,
  })
  return response.data
}

export const createPayment = async (amount, redirectUrl) => {
  const response = await apiClient.post(API_ENDPOINTS.PAYMENT.CREATE, {
    amount,
    redirectUrl,
  })
  return response.data
}

export const getPaymentStatus = async (paymentCode) => {
  const url = API_ENDPOINTS.PAYMENT.GET.replace(':paymentCode', paymentCode)
  const response = await apiClient.get(url)
  return response.data
}

export const mockPaymentCallback = async (paymentCode, result) => {
  const response = await apiClient.post(API_ENDPOINTS.PAYMENT.MOCK_CALLBACK, {
    paymentCode,
    result,
  })
  return response.data
}

export const cancelPayment = async (paymentCode) => {
  const url = API_ENDPOINTS.PAYMENT.CANCEL.replace(':paymentCode', paymentCode)
  const response = await apiClient.post(url)
  return response.data
}
