import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import {
  addToCart,
  deleteCartItemById,
  fetchCartByUserId,
  resetCartByUserId,
  updateCartItemById,
} from './CartApi'

const normalizeGuestCartItem = (item) => {
  if (!item) return null

  if (item.product?._id) {
    return {
      ...item,
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
      _id: item._id || item.product._id,
    }
  }

  if (item._id && item.title) {
    return {
      _id: item._id,
      product: item,
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    }
  }

  return null
}

const sanitizeGuestCartItems = (items = []) => {
  if (!Array.isArray(items)) return []
  return items.map(normalizeGuestCartItem).filter(Boolean)
}

const initialState = {
  status: 'idle',
  items: [],
  cartItemAddStatus: 'idle',
  cartItemRemoveStatus: 'idle',
  errors: null,
  successMessage: null,
}

export const addToCartAsync = createAsyncThunk('cart/addToCartAsync', async (item) => {
  const addedItem = await addToCart(item)
  return addedItem
})

export const fetchCartByUserIdAsync = createAsyncThunk('cart/fetchCartByUserIdAsync', async (id) => {
  const items = await fetchCartByUserId(id)
  return items
})

export const updateCartItemByIdAsync = createAsyncThunk('cart/updateCartItemByIdAsync', async (update) => {
  const updatedItem = await updateCartItemById(update)
  return updatedItem
})

export const deleteCartItemByIdAsync = createAsyncThunk('cart/deleteCartItemByIdAsync', async (id) => {
  const deletedItem = await deleteCartItemById(id)
  return deletedItem
})

export const resetCartByUserIdAsync = createAsyncThunk('cart/resetCartByUserIdAsync', async (userId) => {
  const updatedCart = await resetCartByUserId(userId)
  return updatedCart
})

const cartSlice = createSlice({
  name: 'cartSlice',
  initialState,
  reducers: {
    resetCartItemAddStatus: (state) => {
      state.cartItemAddStatus = 'idle'
    },
    resetCartItemRemoveStatus: (state) => {
      state.cartItemRemoveStatus = 'idle'
    },
    addToGuestCart: (state, action) => {
      const product = action.payload

      state.items = sanitizeGuestCartItems(state.items)
      const index = state.items.findIndex((item) => item?.product?._id === product._id)

      if (index > -1) {
        state.items[index].quantity += 1
      } else {
        state.items.push({
          product,
          quantity: 1,
          _id: Date.now().toString(),
        })
      }

      localStorage.setItem('guestCart', JSON.stringify(state.items))
      state.cartItemAddStatus = 'fulfilled'
    },
    fetchGuestCart: (state) => {
      const localCart = localStorage.getItem('guestCart')
      if (!localCart) return

      state.items = sanitizeGuestCartItems(JSON.parse(localCart))
      localStorage.setItem('guestCart', JSON.stringify(state.items))
    },
    removeFromGuestCart: (state, action) => {
      const id = action.payload
      state.items = sanitizeGuestCartItems(state.items).filter((item) => item._id !== id)
      localStorage.setItem('guestCart', JSON.stringify(state.items))
      state.cartItemRemoveStatus = 'fulfilled'
    },
    updateGuestCartQuantity: (state, action) => {
      const { _id, quantity } = action.payload
      state.items = sanitizeGuestCartItems(state.items)

      const index = state.items.findIndex((item) => item._id === _id)
      if (index > -1) {
        state.items[index].quantity = quantity
        localStorage.setItem('guestCart', JSON.stringify(state.items))
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.cartItemAddStatus = 'pending'
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.cartItemAddStatus = 'fulfilled'
        state.items.push(action.payload)
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.cartItemAddStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(fetchCartByUserIdAsync.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(fetchCartByUserIdAsync.fulfilled, (state, action) => {
        state.status = 'fulfilled'
        state.items = action.payload
      })
      .addCase(fetchCartByUserIdAsync.rejected, (state, action) => {
        state.status = 'rejected'
        state.errors = action.error
      })

      .addCase(updateCartItemByIdAsync.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(updateCartItemByIdAsync.fulfilled, (state, action) => {
        state.status = 'fulfilled'
        const index = state.items.findIndex((item) => item._id === action.payload._id)
        state.items[index] = action.payload
      })
      .addCase(updateCartItemByIdAsync.rejected, (state, action) => {
        state.status = 'rejected'
        state.errors = action.error
      })

      .addCase(deleteCartItemByIdAsync.pending, (state) => {
        state.cartItemRemoveStatus = 'pending'
      })
      .addCase(deleteCartItemByIdAsync.fulfilled, (state, action) => {
        state.cartItemRemoveStatus = 'fulfilled'
        state.items = state.items.filter((item) => item._id !== action.payload._id)
      })
      .addCase(deleteCartItemByIdAsync.rejected, (state, action) => {
        state.cartItemRemoveStatus = 'rejected'
        state.errors = action.error
      })

      .addCase(resetCartByUserIdAsync.pending, (state) => {
        state.status = 'pending'
      })
      .addCase(resetCartByUserIdAsync.fulfilled, (state) => {
        state.status = 'fulfilled'
        state.items = []
      })
      .addCase(resetCartByUserIdAsync.rejected, (state, action) => {
        state.status = 'rejected'
        state.errors = action.error
      })
  },
})

export const selectCartStatus = (state) => state.CartSlice.status
export const selectCartItems = (state) => state.CartSlice.items
export const selectCartErrors = (state) => state.CartSlice.errors
export const selectCartSuccessMessage = (state) => state.CartSlice.successMessage
export const selectCartItemAddStatus = (state) => state.CartSlice.cartItemAddStatus
export const selectCartItemRemoveStatus = (state) => state.CartSlice.cartItemRemoveStatus

export const {
  resetCartItemAddStatus,
  resetCartItemRemoveStatus,
  addToGuestCart,
  fetchGuestCart,
  removeFromGuestCart,
  updateGuestCartQuantity,
} = cartSlice.actions

export default cartSlice.reducer
