import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Lottie from 'lottie-react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'

import {
  getOrderByUserIdAsync,
  resetOrderFetchStatus,
  selectOrderFetchStatus,
  selectOrders,
} from '../OrderSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import {
  addToCartAsync,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems,
} from '../../cart/CartSlice'
import { loadingAnimation, noOrdersAnimation } from '../../../assets'
import { getImageUrl } from '../../../utils/imageUrl'
import { formatCurrency } from '../../../utils/formatCurrency'

export const UserOrders = () => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)
  const orders = useSelector(selectOrders)
  const cartItems = useSelector(selectCartItems)
  const orderFetchStatus = useSelector(selectOrderFetchStatus)
  const cartItemAddStatus = useSelector(selectCartItemAddStatus)

  const theme = useTheme()
  const is1200 = useMediaQuery(theme.breakpoints.down('1200'))
  const is768 = useMediaQuery(theme.breakpoints.down('768'))
  const is660 = useMediaQuery(theme.breakpoints.down(660))
  const is480 = useMediaQuery(theme.breakpoints.down('480'))

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (loggedInUser?._id) {
      dispatch(getOrderByUserIdAsync(loggedInUser._id))
    }
  }, [dispatch, loggedInUser?._id])

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') {
      toast.success('Sản phẩm đã được thêm vào giỏ')
    } else if (cartItemAddStatus === 'rejected') {
      toast.error('Lỗi khi thêm sản phẩm vào giỏ hàng')
    }
  }, [cartItemAddStatus])

  useEffect(() => {
    if (orderFetchStatus === 'rejected') {
      toast.error('Lỗi khi tải đơn hàng, vui lòng thử lại sau')
    }
  }, [orderFetchStatus])

  useEffect(() => {
    return () => {
      dispatch(resetOrderFetchStatus())
      dispatch(resetCartItemAddStatus())
    }
  }, [dispatch])

  const handleAddToCart = (product) => {
    dispatch(addToCartAsync({ user: loggedInUser._id, product: product._id, quantity: 1 }))
  }

  if (orderFetchStatus === 'pending') {
    return (
      <Stack width={is480 ? 'auto' : '25rem'} height="calc(100vh - 4rem)" justifyContent="center" alignItems="center">
        <Lottie animationData={loadingAnimation} />
      </Stack>
    )
  }

  return (
    <Stack justifyContent="center" alignItems="center">
      <Stack width={is1200 ? 'auto' : '60rem'} p={is480 ? 2 : 4} mb="5rem">
        <Stack flexDirection="row" columnGap={2}>
          {!is480 && (
            <motion.div whileHover={{ x: -5 }} style={{ alignSelf: 'center' }}>
              <IconButton component={Link} to="/">
                <ArrowBackIcon fontSize="large" />
              </IconButton>
            </motion.div>
          )}

          <Stack rowGap={1}>
            <Typography variant="h4" fontWeight={500}>
              Lịch sử đặt hàng
            </Typography>
            <Typography color="text.secondary">
              Theo dõi lại những đơn đã mua và đặt lại sản phẩm nhanh hơn.
            </Typography>
          </Stack>
        </Stack>

        <Stack mt={5} rowGap={5}>
          {orders.map((order) => (
            <Stack key={order._id} p={is480 ? 0 : 2} component={is480 ? 'div' : Paper} elevation={1} rowGap={2}>
              <Stack flexDirection="row" rowGap="1rem" justifyContent="space-between" flexWrap="wrap">
                <Stack flexDirection="row" columnGap={4} rowGap="1rem" flexWrap="wrap">
                  <Stack>
                    <Typography>Mã đơn</Typography>
                    <Typography color="text.secondary">{order._id}</Typography>
                  </Stack>

                  <Stack>
                    <Typography>Ngày đặt</Typography>
                    <Typography color="text.secondary">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Stack>

                  <Stack>
                    <Typography>Tổng tiền</Typography>
                    <Typography>{formatCurrency(order.total)}</Typography>
                  </Stack>
                </Stack>

                <Stack>
                  <Typography>Số lượng sản phẩm: {order.item.length}</Typography>
                </Stack>
              </Stack>



              <Stack rowGap={2}>
                {order.item.map((item, index) => (

                  <Stack
                    key={`${order._id}-${index}`}
                    mt={2}
                    flexDirection="row"
                    rowGap={is768 ? '2rem' : 0}
                    columnGap={4}
                    flexWrap={is768 ? 'wrap' : 'nowrap'}
                  >
                    <Stack>
                      <img
                        src={item.product ? getImageUrl(item.product.images?.[0]) : "https://via.placeholder.com/150"}
                        style={{
                          width: '100%',
                          aspectRatio: is480 ? 3 / 2 : 1 / 1,
                          objectFit: 'contain',
                        }}
                        alt={item.product?.title || "Sản phẩm không tồn tại"}
                      />
                    </Stack>

                    <Stack rowGap={1} width="100%">
                      <Stack flexDirection="row" justifyContent="space-between">
                        <Stack>
                          <Typography variant="h6" fontSize="1rem" fontWeight={500}>
                            {item.product?.title || "Sản phẩm không tồn tại"}
                          </Typography>
                          <Typography variant="body1" fontSize=".9rem" color="text.secondary">
                            {item.product?.brand?.name || item.product?.brand || 'Thuong hieu dang cap nhat'}
                          </Typography>
                          <Typography color="text.secondary" fontSize=".9rem">
                            Qty: {item.quantity}
                          </Typography>
                        </Stack>
                        <Typography>{item.product ? formatCurrency(item.product.price) : "0đ"}</Typography>
                      </Stack>

                      <Typography color="text.secondary">{item.product?.description || ""}</Typography>

                      <Stack mt={2} alignSelf={is480 ? 'flex-start' : 'flex-end'} flexDirection="row" columnGap={2}>
                        <Button
                          size="small"
                          component={Link}
                          to={item.product ? `/product-details/${item.product._id}` : "#"}
                          variant="outlined"
                        >
                          Xem chi tiết sản phẩm
                        </Button>
                        {cartItems.some((cartItem) => cartItem?.product?._id === item.product?._id) ? (
                          <Button size="small" variant="contained" component={Link} to="/cart">
                            Đã có sẵn trong giỏ
                          </Button>
                        ) : (
                          <Button size="small" variant="contained" onClick={() => handleAddToCart(item.product)}>
                            Mua lại
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              <Stack mt={2} flexDirection="row" justifyContent="space-between">
                <Typography mb={2}>Trạng thái: {order.status}</Typography>
              </Stack>
            </Stack>
          ))}

          {!orders.length && (
            <Stack mt={is480 ? '2rem' : 0} mb="7rem" alignSelf="center" rowGap={2}>
              <Stack width={is660 ? 'auto' : '30rem'} height={is660 ? 'auto' : '30rem'}>
                <Lottie animationData={noOrdersAnimation} />
              </Stack>

              <Typography textAlign="center" alignSelf="center" variant="h6">
                Chưa có đơn hàng nào
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  )
}
