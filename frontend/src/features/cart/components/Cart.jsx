import React, { useEffect } from 'react'
import { Button, Chip, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { toast } from 'react-toastify'

import { CartItem } from './CartItem'
import {
  resetCartItemRemoveStatus,
  selectCartItemRemoveStatus,
  selectCartItems,
} from '../CartSlice'
import { SHIPPING } from '../../../constants'
import { emptyWishlistAnimation } from '../../../assets'
import { formatCurrency } from '../../../utils/formatCurrency'

export const Cart = ({ checkout }) => {
  const items = useSelector(selectCartItems)
  const cartItemRemoveStatus = useSelector(selectCartItemRemoveStatus)
  const dispatch = useDispatch()

  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))

  const validItems = items.filter((item) => item.product)
  const subtotal = validItems.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0
  )
  const totalItems = validItems.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (cartItemRemoveStatus === 'fulfilled') {
      toast.success('Sản phẩm đã được xóa khỏi giỏ')
    } else if (cartItemRemoveStatus === 'rejected') {
      toast.error('Không thể xóa sản phẩm khỏi giỏ hàng')
    }
  }, [cartItemRemoveStatus])

  useEffect(() => {
    return () => {
      dispatch(resetCartItemRemoveStatus())
    }
  }, [dispatch])

  if (validItems.length === 0) {
    return (
      <Stack minHeight="60vh" alignItems="center" justifyContent="center" rowGap={2}>
        <Lottie animationData={emptyWishlistAnimation} style={{ width: 300 }} />
        <Typography variant="h5">Giỏ hàng của bạn đang trống</Typography>
        <Button variant="contained" component={Link} to="/">
          Mua sắm ngay
        </Button>
      </Stack>
    )
  }

  return (
    <Stack justifyContent="flex-start" alignItems="center" mb="5rem">
      <Stack
        width={is900 ? 'auto' : '50rem'}
        mt="3rem"
        px={checkout ? 0 : 2}
        rowGap={4}
      >
        <Stack rowGap={2}>
          {validItems.map((item) => (
            <CartItem
              key={item._id}
              id={item._id}
              title={item.product?.title}
              brand={item.product?.brand?.name || item.product?.brand || 'No Brand'}
              category={item.product?.category?.name || item.product?.category || 'General'}
              price={item.product?.price}
              quantity={item.quantity}
              thumbnail={item.product?.thumbnail}
              stockQuantity={item.product?.stockQuantity}
              productId={item.product?._id}
            />
          ))}
        </Stack>

        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          {checkout ? (
            <Stack rowGap={2} width="100%">
              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Tạm tính</Typography>
                <Typography>{formatCurrency(subtotal)}</Typography>
              </Stack>

              <Stack flexDirection="row" justifyContent="space-between">
                <Typography>Phí vận chuyển</Typography>
                <Typography>{formatCurrency(SHIPPING)}</Typography>
              </Stack>

              <hr />

              <Stack flexDirection="row" justifyContent="space-between">
                <Typography fontWeight={700}>Tổng thanh toán</Typography>
                <Typography fontWeight={700}>{formatCurrency(subtotal + SHIPPING)}</Typography>
              </Stack>
            </Stack>
          ) : (
            <>
              <Stack>
                <Typography variant="h6" fontWeight={500}>
                  Tổng phụ
                </Typography>
                <Typography>Tổng số lượng mặt hàng: {totalItems}</Typography>
                <Typography variant="body1" color="text.secondary">
                  Phí vận chuyển sẽ được tính ở bước thanh toán
                </Typography>
              </Stack>

              <Stack>
                <Typography variant="h6" fontWeight={500}>
                  {formatCurrency(subtotal)}
                </Typography>
              </Stack>
            </>
          )}
        </Stack>

        {!checkout && (
          <Stack rowGap="1rem">
            <Button variant="contained" component={Link} to="/checkout">
              Tiến hành thanh toán
            </Button>
            <motion.div style={{ alignSelf: 'center' }} whileHover={{ y: 2 }}>
              <Chip
                sx={{ cursor: 'pointer', borderRadius: '8px' }}
                component={Link}
                to="/"
                label="Tiếp tục mua hàng"
                variant="outlined"
              />
            </motion.div>
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
