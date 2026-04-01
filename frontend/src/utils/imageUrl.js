
const getRuntimeApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`
}

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BASE_URL ||
  getRuntimeApiBaseUrl()

export const getImageUrl = (path) => {
  if (!path) return ''


  if (path.startsWith('http')) return path

  
  if (!path.startsWith('/')) {
    return `${API_BASE_URL}/${path}`
  }

  return `${API_BASE_URL}${path}`
}
