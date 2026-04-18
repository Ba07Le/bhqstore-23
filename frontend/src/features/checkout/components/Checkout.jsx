import React, { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Grid,
  IconButton,
  Paper,
  Radio,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Box,
} from '@mui/material'
import { LoadingButton } from '@mui/lab'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

import { SHIPPING } from '../../../constants'
import { addAddressAsync, selectAddressStatus, selectAddresses } from '../../address/AddressSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { resetCartByUserIdAsync, selectCartItems } from '../../cart/CartSlice'
import { Cart } from '../../cart/components/Cart'
import {
  createOrderAsync,
  createPaymentSessionAsync,
  resetPaymentSessionStatus,
  selectCurrentOrder,
  selectOrderStatus,
  selectPaymentSessionStatus,
} from '../../order/OrderSlice'

const paymentOptions = [
  {
    value: 'COD',
    label: 'Thanh toán khi nhận hàng',
    helper: 'Đơn hàng được tạo ngay và thanh toán khi nhận hàng',
  },
  {
    value: 'MOMO',
    label: 'MoMo eWallet',
    helper: 'Chuyển hướng sang ví MOMO và thanh toán online',
  },
  {
    value: 'VNPAY',
    label: 'VNPay',
    helper: 'Thanh toán online qua cổng VNPAY và ngân hàng',
  },
]

export const Checkout = () => {
  const addresses = useSelector(selectAddresses)
  const savedAddresses = useMemo(() => addresses || [], [addresses])
  const loggedInUser = useSelector(selectLoggedInUser)
  const addressStatus = useSelector(selectAddressStatus)
  const cartItems = useSelector(selectCartItems)
  const orderStatus = useSelector(selectOrderStatus)
  const paymentSessionStatus = useSelector(selectPaymentSessionStatus)
  const currentOrder = useSelector(selectCurrentOrder)

  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0] || null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('COD')
  const [guestAddress, setGuestAddress] = useState(null)

  const { register, handleSubmit, reset } = useForm()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (accumulator, item) =>
          accumulator + Number(item?.product?.price || 0) * Number(item?.quantity || 0),
        0
      ),
    [cartItems]
  )
  const orderTotal = subtotal + SHIPPING
  const isSubmittingPayment =
    orderStatus === 'pending' || paymentSessionStatus === 'pending'

  useEffect(() => {
    if (savedAddresses.length && !selectedAddress) {
      setSelectedAddress(savedAddresses[0])
    }
  }, [savedAddresses, selectedAddress])

  useEffect(() => {
    if (addressStatus === 'fulfilled') {
      reset()
      toast.success(loggedInUser ? 'Đã thêm địa chỉ mới' : 'Đã xác nhận địa chỉ giao hàng')
    } else if (addressStatus === 'rejected') {
      toast.error('Không thể lưu địa chỉ, vui lòng thử lại')
    }
  }, [addressStatus, loggedInUser, reset])

  useEffect(() => {
    if (currentOrder && currentOrder?._id && currentOrder.paymentMode === 'COD') {
      if (loggedInUser) {
        dispatch(resetCartByUserIdAsync(loggedInUser?._id))
      } else {
        localStorage.removeItem('guestCart')
      }
      navigate(`/order-success/${currentOrder?._id}`)
    }
  }, [currentOrder, dispatch, loggedInUser, navigate])

  useEffect(() => {
    return () => {
      dispatch(resetPaymentSessionStatus())
    }
  }, [dispatch])

  const handleAddAddress = (data) => {
    if (loggedInUser) {
      const nextAddress = { ...data, user: loggedInUser._id }
      dispatch(addAddressAsync(nextAddress))
      return
    }

    setGuestAddress(data)
    toast.success('Đã xác nhận thông tin giao hàng')
  }

  const handleCreateOrder = async () => {
    const finalAddress = loggedInUser ? selectedAddress : guestAddress

    if (!cartItems.length) {
      toast.error('Giỏ hàng đang trống')
      return
    }

    if (!finalAddress) {
      toast.error("Vui lòng nhập địa chỉ và bấm xác nhận trước khi thanh toán")
      return
    }

    const order = {
      user: loggedInUser ? loggedInUser._id : null,
      item: cartItems,
      address: finalAddress,
      paymentMode: selectedPaymentMethod,
      total: orderTotal,
    }

    if (selectedPaymentMethod === 'COD') {
      dispatch(createOrderAsync(order))
      return
    }

    try {
      const session = await dispatch(
        createPaymentSessionAsync({
          gateway: selectedPaymentMethod,
          order,
        })
      ).unwrap()

      if (!session?.payUrl) {
        throw new Error('Khong tao duoc duong dan thanh toan')
      }

      window.location.assign(session.payUrl)
    } catch (error) {
      toast.error(error?.message || 'Khong the khoi tao cong thanh toan')
    }
  }

  return (
    <Box sx={{ p: 2, maxWidth: '1400px', mx: 'auto', mb: '5rem', mt: 2 }}>
      {/* Header */}
      <Stack flexDirection="row" columnGap={1} alignItems="center" mb={4}>
        <motion.div whileHover={{ x: -5 }}>
          <IconButton component={Link} to="/cart">
            <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
          </IconButton>
        </motion.div>
        <Typography variant="h4" fontWeight={800}>Thông tin thanh toán</Typography>
      </Stack>

      <Grid container spacing={4}>
        {/* CỘT TRÁI: ĐỊA CHỈ */}
        <Grid item xs={12} md={7}>
          <Stack rowGap={3}>
            <Typography variant="h6" fontWeight={700}>1. Địa chỉ nhận hàng</Typography>
            <Stack component="form" noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Họ tên người nhận" {...register('type', { required: true })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại" type="number" {...register('phoneNumber', { required: true })} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Địa chỉ (Số nhà, tên đường)" {...register('street', { required: true })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Thành phố" {...register('city', { required: true })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Mã bưu chính" type="number" {...register('postalCode', { required: true })} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth label="Quốc gia" defaultValue="Việt Nam" {...register('country', { required: true })} />
                </Grid>
              </Grid>

              <Stack flexDirection="row" alignSelf="flex-end" columnGap={1}>
                <Button color="inherit" onClick={() => reset()}>XÓA FORM</Button>
                <LoadingButton loading={addressStatus === 'pending'} type="submit" variant="contained" sx={{ bgcolor: 'black' }}>
                  {loggedInUser ? 'LƯU ĐỊA CHỈ MỚI' : 'XÁC NHẬN ĐỊA CHỈ'}
                </LoadingButton>
              </Stack>
            </Stack>

            {loggedInUser && savedAddresses.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" mb={2}>Hoặc chọn từ địa chỉ đã lưu:</Typography>
                <Grid container spacing={2}>
                  {savedAddresses.map((address, index) => (
                    <Grid item xs={12} sm={6} key={address._id || index}>
                      <Paper
                        elevation={0}
                        onClick={() => setSelectedAddress(address)}
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          border: selectedAddress === address ? '2px solid black' : '1px solid #e0e0e0',
                          borderRadius: 2
                        }}
                      >
                        <Stack flexDirection="row" alignItems="center" justifyContent="space-between">
                          <Typography fontWeight={700}>{address.type}</Typography>
                          <Radio checked={selectedAddress === address} />
                        </Stack>
                        <Typography variant="body2">{address.street}</Typography>
                        <Typography variant="body2">{address.city}, {address.country}</Typography>
                        <Typography variant="body2" fontWeight={600}>{address.phoneNumber}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Stack>
        </Grid>

        {/* CỘT PHẢI: PHƯƠNG THỨC THANH TOÁN */}
        <Grid item xs={12} md={5}>
          <Stack rowGap={3}>
            <Typography variant="h6" fontWeight={700}>2. Phương thức thanh toán</Typography>
            <Stack rowGap={2}>
              {paymentOptions.map((option) => (
                <Paper
                  key={option.value}
                  elevation={0}
                  onClick={() => setSelectedPaymentMethod(option.value)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: selectedPaymentMethod === option.value ? '2px solid black' : '1px solid #e0e0e0',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography fontWeight={700}>{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.helper}</Typography>
                    </Box>
                    <Radio checked={selectedPaymentMethod === option.value} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* HÀNG DƯỚI: ĐƠN HÀNG (HIỂN THỊ HẾT CART) */}
        <Grid item xs={12}>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" fontWeight={800} mb={3}>3. Đơn hàng của bạn</Typography>
          
          <Paper elevation={0} sx={{ border: '1px solid #f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
            {/* Component Cart hiển thị đầy đủ danh sách */}
            <Cart checkout />

            {/* Khối tính tiền CĂN GIỮA */}
            <Stack alignItems="center" p={4} bgcolor="#fafafa">
              <Stack spacing={1.5} sx={{ width: { xs: '100%', md: '450px' } }}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Tạm tính</Typography>
                  <Typography fontWeight={700}>{subtotal.toLocaleString()}đ</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Phí vận chuyển</Typography>
                  <Typography fontWeight={700}>{SHIPPING.toLocaleString()}đ</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" fontWeight={900}>Tổng thanh toán</Typography>
                  <Typography variant="h5" fontWeight={900}>
                    {orderTotal.toLocaleString()}đ
                  </Typography>
                </Stack>

                <LoadingButton
                  fullWidth
                  loading={isSubmittingPayment}
                  variant="contained"
                  onClick={handleCreateOrder}
                  size="large"
                  sx={{ 
                    py: 2, 
                    mt: 2, 
                    borderRadius: 3, 
                    fontWeight: 900, 
                    bgcolor: 'black',
                    '&:hover': { bgcolor: '#333' }
                  }}
                >
                  {selectedPaymentMethod === 'COD'
                    ? 'XÁC NHẬN ĐẶT HÀNG'
                    : `THANH TOÁN QUA ${selectedPaymentMethod}`}
                </LoadingButton>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}