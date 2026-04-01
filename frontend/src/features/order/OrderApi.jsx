import { axiosi } from '../../config/axios'

const getErrorPayload = (error) =>
  new Error(error.response?.data?.message || error.message || 'Request failed')

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    searchParams.set(key, value)
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

export const createOrder = async (order) => {
  try {
    const res = await axiosi.post('/orders', order)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const createPaymentSession = async (payload) => {
  try {
    const res = await axiosi.post('/orders/payment/create-session', payload)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const verifyPaymentReturn = async (payload) => {
  try {
    const res = await axiosi.post('/orders/payment/verify', payload)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const completeMockPayment = async (payload) => {
  try {
    const res = await axiosi.post('/orders/payment/mock/complete', payload)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const getOrderByUserId = async (id) => {
  try {
    const res = await axiosi.get(`/orders/user/${id}`)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const getOrderById = async (id) => {
  try {
    const res = await axiosi.get(`/orders/${id}`)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const getAllOrders = async () => {
  try {
    const res = await axiosi.get('/orders')
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const getOrderOverview = async (filters = {}) => {
  try {
    const res = await axiosi.get(`/orders/stats/overview${buildQueryString(filters)}`)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}

export const updateOrderById = async (update) => {
  try {
    const res = await axiosi.patch(`/orders/${update._id}`, update)
    return res.data
  } catch (error) {
    throw getErrorPayload(error)
  }
}
