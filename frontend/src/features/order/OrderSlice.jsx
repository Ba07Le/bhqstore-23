import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  completeMockPayment,
  createOrder,
  createPaymentSession,
  getAllOrders,
  getOrderById,
  getOrderByUserId,
  getOrderOverview,
  verifyPaymentReturn,
  updateOrderById,
} from './OrderApi'

const initialState = {
  status: 'idle',
  orderUpdateStatus: 'idle',
  orderFetchStatus: 'idle',
  orderStatsStatus: 'idle',
  paymentSessionStatus: 'idle',
  paymentVerificationStatus: 'idle',
  orders: [],
  overview: null,
  currentOrder: null,
  paymentResult: null,
  errors: null,
  successMessage: null,
}

export const createOrderAsync = createAsyncThunk('orders/createOrderAsync', async (order) => {
  const createdOrder = await createOrder(order)
  return createdOrder
})

export const getAllOrdersAsync = createAsyncThunk('orders/getAllOrdersAsync', async () => {
  const orders = await getAllOrders()
  return orders
})

export const getOrderByUserIdAsync = createAsyncThunk('orders/getOrderByUserIdAsync', async (id) => {
  const orders = await getOrderByUserId(id)
  return orders
})

export const getOrderByIdAsync = createAsyncThunk('orders/getOrderByIdAsync', async (id) => {
  const order = await getOrderById(id)
  return order
})

export const createPaymentSessionAsync = createAsyncThunk(
  'orders/createPaymentSessionAsync',
  async (payload) => {
    const session = await createPaymentSession(payload)
    return session
  }
)

export const getOrderOverviewAsync = createAsyncThunk(
  'orders/getOrderOverviewAsync',
  async (filters = {}) => {
    const overview = await getOrderOverview(filters)
    return overview
  }
)

export const updateOrderByIdAsync = createAsyncThunk(
  'orders/updateOrderByIdAsync',
  async (update) => {
    const updatedOrder = await updateOrderById(update)
    return updatedOrder
  }
)

export const verifyPaymentReturnAsync = createAsyncThunk(
  'orders/verifyPaymentReturnAsync',
  async (payload) => {
    const verification = await verifyPaymentReturn(payload)
    return verification
  }
)

export const completeMockPaymentAsync = createAsyncThunk(
  'orders/completeMockPaymentAsync',
  async (payload) => {
    const result = await completeMockPayment(payload)
    return result
  }
)

const orderSlice = createSlice({
  name: 'orderSlice',
  initialState,
  reducers: {
    resetCurrentOrder: (state) => {
      state.currentOrder = null
    },
    resetPaymentResult: (state) => {
      state.paymentResult = null
      state.paymentVerificationStatus = 'idle'
    },
    resetPaymentSessionStatus: (state) => {
      state.paymentSessionStatus = 'idle'
    },
    resetOrderUpdateStatus: (state) => {
      state.orderUpdateStatus = 'idle'
    },
    resetOrderFetchStatus: (state) => {
      state.orderFetchStatus = 'idle'
    },
    resetOrderStatsStatus: (state) => {
      state.orderStatsStatus = 'idle'
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderAsync.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        state.status = 'fulfilled'
        state.orders.push(action.payload)
        state.currentOrder = action.payload
      })
      .addCase(createOrderAsync.rejected, (state, action) => {
        state.status = 'rejected'
        state.errors = action.error
      })

      .addCase(createPaymentSessionAsync.pending, (state) => {
        state.paymentSessionStatus = 'pending'
      })
      .addCase(createPaymentSessionAsync.fulfilled, (state) => {
        state.paymentSessionStatus = 'fulfilled'
      })
      .addCase(createPaymentSessionAsync.rejected, (state, action) => {
        state.paymentSessionStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(getAllOrdersAsync.pending, (state) => {
        state.orderFetchStatus = 'pending'
      })
      .addCase(getAllOrdersAsync.fulfilled, (state, action) => {
        state.orderFetchStatus = 'fulfilled'
        state.orders = action.payload
      })
      .addCase(getAllOrdersAsync.rejected, (state, action) => {
        state.orderFetchStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(getOrderByUserIdAsync.pending, (state) => {
        state.orderFetchStatus = 'pending'
      })
      .addCase(getOrderByUserIdAsync.fulfilled, (state, action) => {
        state.orderFetchStatus = 'fulfilled'
        state.orders = action.payload
      })
      .addCase(getOrderByUserIdAsync.rejected, (state, action) => {
        state.orderFetchStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(getOrderByIdAsync.pending, (state) => {
        state.orderFetchStatus = 'pending'
      })
      .addCase(getOrderByIdAsync.fulfilled, (state, action) => {
        state.orderFetchStatus = 'fulfilled'
        state.currentOrder = action.payload
      })
      .addCase(getOrderByIdAsync.rejected, (state, action) => {
        state.orderFetchStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(getOrderOverviewAsync.pending, (state) => {
        state.orderStatsStatus = 'pending'
      })
      .addCase(getOrderOverviewAsync.fulfilled, (state, action) => {
        state.orderStatsStatus = 'fulfilled'
        state.overview = action.payload
      })
      .addCase(getOrderOverviewAsync.rejected, (state, action) => {
        state.orderStatsStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(updateOrderByIdAsync.pending, (state) => {
        state.orderUpdateStatus = 'pending'
      })
      .addCase(updateOrderByIdAsync.fulfilled, (state, action) => {
        state.orderUpdateStatus = 'fulfilled'
        const index = state.orders.findIndex((order) => order._id === action.payload._id)
        if (index !== -1) {
          state.orders[index] = action.payload
        }
      })
      .addCase(updateOrderByIdAsync.rejected, (state, action) => {
        state.orderUpdateStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(verifyPaymentReturnAsync.pending, (state) => {
        state.paymentVerificationStatus = 'pending'
      })
      .addCase(verifyPaymentReturnAsync.fulfilled, (state, action) => {
        state.paymentVerificationStatus = 'fulfilled'
        state.paymentResult = action.payload
        state.currentOrder = action.payload.order
      })
      .addCase(verifyPaymentReturnAsync.rejected, (state, action) => {
        state.paymentVerificationStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(completeMockPaymentAsync.pending, (state) => {
        state.paymentVerificationStatus = 'pending'
      })
      .addCase(completeMockPaymentAsync.fulfilled, (state, action) => {
        state.paymentVerificationStatus = 'fulfilled'
        state.paymentResult = action.payload
        state.currentOrder = action.payload.order
      })
      .addCase(completeMockPaymentAsync.rejected, (state, action) => {
        state.paymentVerificationStatus = 'rejected'
        state.errors = action.error
      })
  },
})

export const {
  resetCurrentOrder,
  resetPaymentResult,
  resetPaymentSessionStatus,
  resetOrderUpdateStatus,
  resetOrderFetchStatus,
  resetOrderStatsStatus,
} = orderSlice.actions

export const selectOrderStatus = (state) => state.OrderSlice.status
export const selectOrders = (state) => state.OrderSlice.orders
export const selectOrdersErrors = (state) => state.OrderSlice.errors
export const selectOrdersSuccessMessage = (state) => state.OrderSlice.successMessage
export const selectCurrentOrder = (state) => state.OrderSlice.currentOrder
export const selectOrderUpdateStatus = (state) => state.OrderSlice.orderUpdateStatus
export const selectOrderFetchStatus = (state) => state.OrderSlice.orderFetchStatus
export const selectOrderOverview = (state) => state.OrderSlice.overview
export const selectOrderStatsStatus = (state) => state.OrderSlice.orderStatsStatus
export const selectPaymentSessionStatus = (state) => state.OrderSlice.paymentSessionStatus
export const selectPaymentVerificationStatus = (state) => state.OrderSlice.paymentVerificationStatus
export const selectPaymentResult = (state) => state.OrderSlice.paymentResult

export default orderSlice.reducer
