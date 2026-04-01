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
    'Khach hang'

  const isLoading =
    paymentVerificationStatus === 'pending' ||
    (orderFetchStatus === 'pending' && !order)

  const isSuccess = isGatewayReturn
    ? paymentResult?.success
    : order?.paymentMode === 'COD' || order?.paymentStatus === 'paid'

  const title = isSuccess
    ? `Don hang #${order?._id || id} da duoc xac nhan`
    : `Thanh toan don hang #${order?._id || id} chua thanh cong`

  const subtitle = isSuccess
    ? 'Cam on ban da dat hang tai BHQStore.'
    : paymentResult?.message ||
      orderErrors?.message ||
      'Ban co the thu lai thanh toan hoac kiem tra trong lich su don hang.'

  const primaryActionTo = loggedInUser ? '/orders' : '/'
  const primaryActionLabel = loggedInUser
    ? 'Kiem tra don hang cua ban'
    : 'Ve trang chu'

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
            <Typography variant="h5">Dang xac minh ket qua thanh toan</Typography>
            <Typography variant="body2" color="text.secondary">
              He thong dang doi chieu trang thai don hang tu cong thanh toan.
            </Typography>
          </Stack>
        ) : (
          <Stack mt={2} rowGap={1} alignItems="center">
            <Typography variant="h6" fontWeight={400}>
              Gui den {orderOwner}
            </Typography>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
            {order?.paymentMode ? (
              <Typography variant="body2" color="text.secondary">
                Phuong thuc: {order.paymentMode}
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
            Tiep tuc mua sam
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}
