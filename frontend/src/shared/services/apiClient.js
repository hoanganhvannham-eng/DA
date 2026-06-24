import axios from 'axios'
import { config } from '../../app/config'

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Tự động gắn JWT token vào mọi request nếu đã đăng nhập
apiClient.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`
  }
  return reqConfig
})

export default apiClient
