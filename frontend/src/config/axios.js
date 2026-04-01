import axios from 'axios'

const getRuntimeApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`
}

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BASE_URL ||
  getRuntimeApiBaseUrl()

export const axiosi = axios.create({
  withCredentials: true,
  baseURL: API_BASE_URL,
  timeout: 15000,
})
