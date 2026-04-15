import { Box, Button, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import Lottie from 'lottie-react'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { orderSuccessAnimation } from '../assets'
import { selectLoggedInUser } from '../features/auth/AuthSlice'
import { resetCartByUserIdAsync } from '../features/cart/CartSlice'
import {
  getOrderByIdAsync,
  resetCurrentOrder,
  resetPaymentResult,
  selectCurrentOrder,
  selectOrderFetchStatus,
  selectOrdersErrors,
  selectPaymentResult,
  selectPaymentVerificationStatus,
  verifyPaymentReturnAsync,
} from '../features/order/OrderSlice'

export const OrderSuccessPage = () => {
  const dispatch = useDispatch()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const currentOrder = useSelector(selectCurrentOrder)
  const paymentResult = useSelector(selectPaymentResult)
  const paymentVerificationStatus = useSelector(selectPaymentVerificationStatus)
  const orderFetchStatus = useSelector(selectOrderFetchStatus)
  const orderErrors = useSelector(selectOrdersErrors)
  const loggedInUser = useSelector(selectLoggedInUser)
  const [hasClearedCart, setHasClearedCart] = useState(false)

  const theme = useTheme()
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  const gateway = searchParams.get('gateway')
  const gatewayParams = useMemo(() => Object.fromEntries(searchParams.entries()), [searchParams])
  const isGatewayReturn = Boolean(gateway)

  useEffect(() => {
    if (!id) return

    if (isGatewayReturn) {
      dispatch(
        verifyPaymentReturnAsync({
          gateway: gateway.toUpperCase(),
          params: gatewayParams,
        })
      )
      return
    }

    if (!currentOrder || currentOrder?._id !== id) {
      dispatch(getOrderByIdAsync(id))
    }
  }, [currentOrder, dispatch, gateway, gatewayParams, id, isGatewayReturn])

  useEffect(() => {
    const orderToProcess = paymentResult?.order || currentOrder

    if (!orderToProcess || hasClearedCart) {
      return
    }

    const isPaidOrder = orderToProcess.paymentStatus === 'paid'
    const isCodOrder = orderToProcess.paymentMode === 'COD'

    if (!isPaidOrder && !isCodOrder) {
      return
    }

    if (loggedInUser?._id) {
      dispatch(resetCartByUserIdAsync(loggedInUser._id))
    } else {
      localStorage.removeItem('guestCart')
    }

    setHasClearedCart(true)
  }, [currentOrder, dispatch, hasClearedCart, loggedInUser, paymentResult])

  useEffect(() => {
    return () => {
      dispatch(resetCurrentOrder())
      dispatch(resetPaymentResult())
    }
  }, [dispatch])

  const order = paymentResult?.order || currentOrder
  const orderOwner =
    order?.user?.name ||
    order?.address?.type ||
    (Array.isArray(order?.address) ? order?.address?.[0]?.type : null) ||
    'Khách hàng'

  const isLoading =
    paymentVerificationStatus === 'pending' ||
    (orderFetchStatus === 'pending' && !order)

  const isSuccess = isGatewayReturn
    ? paymentResult?.success
    : order?.paymentMode === 'COD' || order?.paymentStatus === 'paid'

  const title = isSuccess
    ? `Đơn hàng #${order?._id || id} đã được xác nhận`
    : `Thanh toán đơn hàng #${order?._id || id} chưa thành công`

  const subtitle = isSuccess
    ? 'Cảm ơn bạn đã đặt hàng tại BHQStore.'
    : paymentResult?.message ||
      orderErrors?.message ||
      'Bạn có thể thử lại thanh toán hoặc kiểm tra trong lịch sử thanh toán/đơn hàng.'

  const primaryActionTo = loggedInUser ? '/orders' : '/'
  const primaryActionLabel = loggedInUser
    ? 'Kiểm tra đơn hàng của bạn'
    : 'Về trang chủ'

  return (
    <Stack width="100vw" minHeight="100vh" justifyContent="center" alignItems="center" px={2}>
      <Stack
        component={Paper}
        boxShadow={is480 ? 'none' : ''}
        rowGap={3}
        elevation={1}
        p={is480 ? 2 : 4}
        justifyContent="center"
        alignItems="center"
        maxWidth={560}
        width="100%"
        textAlign="center"
      >
        <Box width="10rem" height="7rem">
          <Lottie animationData={orderSuccessAnimation} />
        </Box>

        {isLoading ? (
          <Stack mt={2} rowGap={1}>
            <Typography variant="h5">Đang xác minh kết quả thanh toán</Typography>
            <Typography variant="body2" color="text.secondary">
              Hệ thống đang đối chiếu trạng thái đơn hàng từ cổng thanh toán.
            </Typography>
          </Stack>
        ) : (
          <Stack mt={2} rowGap={1} alignItems="center">
            <Typography variant="h6" fontWeight={400}>
              Gửi đến {orderOwner}
            </Typography>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
            {order?.paymentMode ? (
              <Typography variant="body2" color="text.secondary">
                Phương thức: {order.paymentMode}
              </Typography>
            ) : null}
          </Stack>
        )}

        <Stack direction={is480 ? 'column' : 'row'} gap={1.5} width="100%">
          <Button
            component={Link}
            to={primaryActionTo}
            fullWidth
            onClick={() => dispatch(resetCurrentOrder())}
            variant="contained"
          >
            {primaryActionLabel}
          </Button>
          <Button component={Link} to="/products" fullWidth variant="outlined">
            Tiếp tục mua sắm
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
