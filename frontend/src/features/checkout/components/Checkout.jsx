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

      if (session?.isMock) {
        toast.info(`Dang chuyen sang che do test ${selectedPaymentMethod} tren local`)
      }

      window.location.assign(session.payUrl)
    } catch (error) {
      toast.error(error?.message || 'Khong the khoi tao cong thanh toan')
    }
  }

  return (
    <Stack
      flexDirection="row"
      p={2}
      rowGap={6}
      justifyContent="center"
      flexWrap="wrap"
      mb="5rem"
      mt={2}
      columnGap={4}
      alignItems="flex-start"
    >
      <Stack rowGap={4}>
        <Stack flexDirection="row" columnGap={is480 ? 0.3 : 1} alignItems="center">
          <motion.div whileHover={{ x: -5 }}>
            <IconButton component={Link} to="/cart">
              <ArrowBackIcon fontSize={is480 ? 'medium' : 'large'} />
            </IconButton>
          </motion.div>
          <Typography variant="h4">Thông tin giao hàng</Typography>
        </Stack>

        <Stack component="form" noValidate rowGap={2} onSubmit={handleSubmit(handleAddAddress)}>
          <Stack>
            <Typography gutterBottom>Người nhận / Nợi nhận</Typography>
            <TextField
              placeholder="Họ tên hoặc công ty..."
              {...register('type', { required: true })}
            />
          </Stack>

          <Stack>
            <Typography gutterBottom>Đường</Typography>
            <TextField {...register('street', { required: true })} />
          </Stack>

          <Stack>
            <Typography gutterBottom>Quốc gia</Typography>
            <TextField {...register('country', { required: true })} defaultValue="Viet Nam" />
          </Stack>

          <Stack>
            <Typography gutterBottom>Số điện thoại</Typography>
            <TextField type="number" {...register('phoneNumber', { required: true })} />
          </Stack>

          <Stack flexDirection="row">
            <Stack width="100%">
              <Typography gutterBottom>Thành phố</Typography>
              <TextField {...register('city', { required: true })} />
            </Stack>
            <Stack width="100%">
              <Typography gutterBottom>Mã bưu chính</Typography>
              <TextField type="number" {...register('postalCode', { required: true })} />
            </Stack>
          </Stack>

          <Stack flexDirection="row" alignSelf="flex-end" columnGap={1}>
            <LoadingButton loading={addressStatus === 'pending'} type="submit" variant="contained">
              {loggedInUser ? 'Thêm địa chỉ' : 'Xác nhận địa chỉ'}
            </LoadingButton>
            <Button color="error" variant="outlined" onClick={() => reset()}>
              Reset
            </Button>
          </Stack>
        </Stack>

        {loggedInUser && savedAddresses.length > 0 && (
          <Stack rowGap={3}>
            <Stack>
              <Typography variant="h6">Địa chỉ đã lưu</Typography>
              <Typography variant="body2" color="text.secondary">
                Chọn từ danh sách của bạn
              </Typography>
            </Stack>

            <Grid
              container
              gap={2}
              width={is900 ? 'auto' : '50rem'}
              justifyContent="flex-start"
              alignContent="flex-start"
            >
              {savedAddresses.map((address, index) => (
                <Stack
                  key={address._id || index}
                  p={2}
                  width={is480 ? '100%' : '20rem'}
                  height={is480 ? 'auto' : '15rem'}
                  rowGap={2}
                  component={Paper}
                  elevation={1}
                  sx={{
                    border:
                      selectedAddress === address
                        ? '2px solid #1976d2'
                        : '1px solid rgba(15,23,42,0.08)',
                  }}
                >
                  <Stack flexDirection="row" alignItems="center">
                    <Radio
                      checked={selectedAddress === address}
                      name="addressRadioGroup"
                      onChange={() => setSelectedAddress(address)}
                    />
                    <Typography fontWeight={600}>{address.type}</Typography>
                  </Stack>
                  <Stack>
                    <Typography>{address.street}</Typography>
                    <Typography>
                      {address.city}, {address.country}
                    </Typography>
                    <Typography>{address.phoneNumber}</Typography>
                  </Stack>
                </Stack>
              ))}
            </Grid>
          </Stack>
        )}

        <Stack rowGap={3}>
          <Stack>
            <Typography variant="h6">Phương thức thanh toán</Typography>
            <Typography variant="body2" color="text.secondary">
              Chọn cách thanh toán phù hợp cho đơn hàng này
            </Typography>
          </Stack>

          <Stack rowGap={2}>
            {paymentOptions.map((option) => (
              <Stack
                key={option.value}
                component={Paper}
                elevation={0}
                direction="row"
                onClick={() => setSelectedPaymentMethod(option.value)}
                justifyContent="space-between"
                alignItems="center"
                p={2}
                sx={{
                  borderRadius: 3,
                  cursor: 'pointer',
                  border:
                    selectedPaymentMethod === option.value
                      ? '2px solid #1976d2'
                      : '1px solid rgba(15,23,42,0.08)',
                }}
              >
                <Stack>
                  <Typography fontWeight={700}>{option.label}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.helper}
                  </Typography>
                </Stack>
                <Radio
                  value={option.value}
                  checked={selectedPaymentMethod === option.value}
                  onChange={() => setSelectedPaymentMethod(option.value)}
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Stack>

      <Stack width={is900 ? '100%' : 'auto'} alignItems={is900 ? 'flex-start' : ''}>
        <Typography variant="h4">Đơn hàng</Typography>
        <Cart checkout />
        <LoadingButton
          fullWidth
          loading={isSubmittingPayment}
          variant="contained"
          onClick={handleCreateOrder}
          size="large"
        >
          {selectedPaymentMethod === 'COD'
            ? 'Đặt hàng'
            : `Thanh toán qua ${selectedPaymentMethod}`}
        </LoadingButton>
      </Stack>
    </Stack>
  )
}
