import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  MobileStepper,
  Paper,
  Rating,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import Favorite from '@mui/icons-material/Favorite'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft'
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight'
import Lottie from 'lottie-react'
import { motion } from 'framer-motion'
import SwipeableViews from 'react-swipeable-views'
import { autoPlay } from 'react-swipeable-views-utils'
import { toast } from 'react-toastify'

import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectSelectedProduct,
} from '../ProductSlice'
import {
  addToCartAsync,
  addToGuestCart,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems,
} from '../../cart/CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import {
  fetchReviewsByProductIdAsync,
  resetReviewFetchStatus,
  selectReviewFetchStatus,
  selectReviews,
} from '../../review/ReviewSlice'
import { Reviews } from '../../review/components/Reviews'
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItems,
} from '../../wishlist/WishlistSlice'
import { loadingAnimation } from '../../../assets'
import { getImageUrl } from '../../../utils/imageUrl'
import { formatCurrency } from '../../../utils/formatCurrency'

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

export const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const product = useSelector(selectSelectedProduct)
  const loggedInUser = useSelector(selectLoggedInUser)
  const cartItems = useSelector(selectCartItems)
  const reviews = useSelector(selectReviews)
  const wishlistItems = useSelector(selectWishlistItems)
  const cartItemAddStatus = useSelector(selectCartItemAddStatus)
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)
  const productFetchStatus = useSelector(selectProductFetchStatus)
  const reviewFetchStatus = useSelector(selectReviewFetchStatus)

  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const theme = useTheme()
  const is1420 = useMediaQuery(theme.breakpoints.down(1420))
  const is990 = useMediaQuery(theme.breakpoints.down(990))
  const is840 = useMediaQuery(theme.breakpoints.down(840))
  const is480 = useMediaQuery(theme.breakpoints.down(480))
  const is387 = useMediaQuery(theme.breakpoints.down(387))

  const images = product?.images?.length ? product.images : product?.thumbnail ? [product.thumbnail] : []
  const maxSteps = images.length

  const isProductAlreadyInCart = cartItems.some((item) => item?.product?._id === id)
  const isProductAlreadyInWishlist = wishlistItems.some(
    (item) => item?.product?._id === id
  )

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0

    const totalReviewRating = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Number((totalReviewRating / reviews.length).toFixed(1))
  }, [reviews])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(id))
      dispatch(fetchReviewsByProductIdAsync(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    setSelectedImageIndex(0)
    setActiveStep(0)
    setQuantity(1)
  }, [id])

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') {
      toast.success('Đã thêm vào giỏ hàng')
    } else if (cartItemAddStatus === 'rejected') {
      toast.error('Lỗi khi thêm vào giỏ hàng')
    }
  }, [cartItemAddStatus])

  useEffect(() => {
    if (wishlistItemAddStatus === 'fulfilled') {
      toast.success('Đã thêm vào yêu thích')
    }
  }, [wishlistItemAddStatus])

  useEffect(() => {
    if (wishlistItemDeleteStatus === 'fulfilled') {
      toast.success('Đã xóa khỏi yêu thích')
    }
  }, [wishlistItemDeleteStatus])

  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct())
      dispatch(resetProductFetchStatus())
      dispatch(resetReviewFetchStatus())
      dispatch(resetWishlistItemDeleteStatus())
      dispatch(resetWishlistItemAddStatus())
      dispatch(resetCartItemAddStatus())
    }
  }, [dispatch])

  const handleAddToCart = () => {
    if (!product) return

    if (loggedInUser) {
      dispatch(addToCartAsync({ user: loggedInUser._id, product: id, quantity }))
    } else {
      dispatch(
        addToGuestCart({
          _id: product._id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          stockQuantity: product.stockQuantity,
          brand: { name: product.brand?.name || '' },
        })
      )
    }

    setQuantity(1)
  }

  const handleDecreaseQty = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const handleIncreaseQty = () => {
    if (quantity < 20 && quantity < (product?.stockQuantity || 0)) {
      setQuantity(quantity + 1)
    }
  }

  const handleAddRemoveFromWishlist = (e) => {
    if (!loggedInUser) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích')
      navigate('/login')
      return
    }

    if (e.target.checked) {
      dispatch(createWishlistItemAsync({ user: loggedInUser._id, product: id }))
    } else {
      const index = wishlistItems.findIndex((item) => item?.product?._id === id)
      if (index !== -1) {
        dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id))
      }
    }
  }

  if (productFetchStatus === 'pending' || reviewFetchStatus === 'pending') {
    return (
      <Stack width="25rem" height="calc(100vh - 8rem)" justifyContent="center" alignItems="center" mx="auto">
        <Lottie animationData={loadingAnimation} />
      </Stack>
    )
  }

  if (!product) {
    return (
      <Stack py={10} px={2} alignItems="center" rowGap={2}>
        <Typography variant="h5" fontWeight={700}>
          Không tìm thấy sản phẩm
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          Sản phẩm có thể đã bị xóa hoặc không còn hiển thị trên hệ thống.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Quay lại trang sản phẩm
        </Button>
      </Stack>
    )
  }

  return (
    <Stack sx={{ justifyContent: 'center', alignItems: 'center', mb: '2rem', mt: is840 ? 2 : 5 }}>
      <Stack>
        <Stack
          width={is480 ? '100%' : is1420 ? '95vw' : '88rem'}
          p={is480 ? 2 : 0}
          flexDirection={is840 ? 'column' : 'row'}
          columnGap={is990 ? '2rem' : '5rem'}
          rowGap={5}
          alignItems="flex-start"
        >
          <Stack sx={{ flexDirection: 'row', columnGap: '2.5rem', flex: 1, alignItems: 'flex-start' }}>
            {!is1420 && (
              <Stack sx={{ display: 'flex', rowGap: '1rem', maxHeight: '500px', overflowY: 'auto', pr: 1, flexShrink: 0 }}>
                {images.map((image, index) => (
                  <Box
                    key={index}
                    component={motion.div}
                    whileHover={{ scale: 1.05 }}
                    sx={{
                      width: '80px',
                      height: '80px',
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '2px solid black' : '1px solid #ddd',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      bgcolor: '#fff',
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      src={getImageUrl(image)}
                      alt={`thumb-${index}`}
                    />
                  </Box>
                ))}
              </Stack>
            )}

            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
              {is1420 ? (
                <Box sx={{ width: '100%', maxWidth: '500px' }}>
                  <AutoPlaySwipeableViews index={activeStep} onChangeIndex={setActiveStep} enableMouseEvents>
                    {images.map((image, index) => (
                      <div key={index}>
                        <img
                          style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain' }}
                          src={getImageUrl(image)}
                          alt={product.title}
                        />
                      </div>
                    ))}
                  </AutoPlaySwipeableViews>
                  <MobileStepper
                    steps={maxSteps}
                    position="static"
                    activeStep={activeStep}
                    nextButton={
                      <Button
                        size="small"
                        onClick={() => setActiveStep((step) => step + 1)}
                        disabled={activeStep === maxSteps - 1}
                      >
                        Tiếp
                        <KeyboardArrowRight />
                      </Button>
                    }
                    backButton={
                      <Button
                        size="small"
                        onClick={() => setActiveStep((step) => step - 1)}
                        disabled={activeStep === 0}
                      >
                        <KeyboardArrowLeft />
                        Quay lại
                      </Button>
                    }
                  />
                </Box>
              ) : (
                <img
                  style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1', objectFit: 'contain' }}
                  src={getImageUrl(images[selectedImageIndex])}
                  alt={product.title}
                />
              )}
            </Box>
          </Stack>

          <Stack rowGap="1.5rem" sx={{ flex: 1 }}>
            <Stack rowGap=".5rem">
              <Typography variant="h4" fontWeight={600}>
                {product.title}
              </Typography>

              <Stack flexDirection="row" alignItems="center" columnGap={1}>
                <Rating value={averageRating} readOnly precision={0.5} />
                <Typography variant="body2" color="text.secondary">
                  {reviews.length === 0 ? 'Chưa có đánh giá' : `${reviews.length} đánh giá`}
                </Typography>
              </Stack>

              <Box mt={1}>
                <Typography
                  fontWeight={500}
                  sx={{
                    color:
                      product.stockQuantity <= 0
                        ? 'error.main'
                        : product.stockQuantity <= 10
                          ? 'warning.main'
                          : 'success.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {product.stockQuantity <= 0
                    ? 'Hết hàng'
                    : product.stockQuantity <= 10
                      ? `Chỉ còn ${product.stockQuantity} sản phẩm`
                      : 'Sản phẩm sẵn sàng giao'}
                </Typography>
              </Box>

              <Typography variant="h5" sx={{ mt: 2, fontWeight: 700, color: 'primary.main' }}>
                {formatCurrency(product.price)}
              </Typography>
            </Stack>

            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {product.description}
              </Typography>
            </Paper>

            {!loggedInUser?.isAdmin && (
              <Stack rowGap={3}>
                <Stack flexDirection="row" alignItems="center" columnGap={is387 ? 1 : 3}>
                  <Stack
                    flexDirection="row"
                    alignItems="center"
                    sx={{ border: '1px solid #ddd', borderRadius: '8px', p: 0.5 }}
                  >
                    <Button onClick={handleDecreaseQty} sx={{ minWidth: '40px', color: 'black' }}>
                      -
                    </Button>
                    <Typography sx={{ px: 2, fontWeight: 600 }}>{quantity}</Typography>
                    <Button onClick={handleIncreaseQty} sx={{ minWidth: '40px', color: 'black' }}>
                      +
                    </Button>
                  </Stack>

                  {isProductAlreadyInCart ? (
                    <Button
                      variant="contained"
                      size="large"
                      sx={{ bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
                      onClick={() => navigate('/cart')}
                    >
                      Vào giỏ hàng
                    </Button>
                  ) : (
                    <Button
                      component={motion.button}
                      whileHover={{ scale: 1.02 }}
                      variant="contained"
                      size="large"
                      disabled={product.stockQuantity <= 0}
                      sx={{ bgcolor: 'black', '&:hover': { bgcolor: '#333' } }}
                      onClick={handleAddToCart}
                    >
                      Thêm vào giỏ
                    </Button>
                  )}

                  <Checkbox
                    checked={loggedInUser ? isProductAlreadyInWishlist : false}
                    onChange={handleAddRemoveFromWishlist}
                    icon={<FavoriteBorder />}
                    checkedIcon={<Favorite sx={{ color: 'red' }} />}
                  />
                </Stack>
              </Stack>
            )}

            <Stack sx={{ border: '1px solid #eee', borderRadius: '12px', bgcolor: '#fafafa' }}>
              <Stack p={2} flexDirection="row" alignItems="center" columnGap={2}>
                <LocalShippingOutlinedIcon color="action" />
                <Box>
                  <Typography fontWeight={600} variant="body2">
                    Giao hàng toàn quốc
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Đơn hàng được cập nhật trạng thái trực tiếp trong tài khoản.
                  </Typography>
                </Box>
              </Stack>
              <Box sx={{ height: '1px', bgcolor: '#eee' }} />
              <Stack p={2} flexDirection="row" alignItems="center" columnGap={2}>
                <CachedOutlinedIcon color="action" />
                <Box>
                  <Typography fontWeight={600} variant="body2">
                    Đổi trả rõ ràng
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Hỗ trợ đổi trả trong 30 ngày nếu sản phẩm phát sinh lỗi.
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Stack>

        <Box mt={8} width={is1420 ? '95vw' : '88rem'}>
          <Reviews productId={id} averageRating={averageRating} />
        </Box>
      </Stack>
    </Stack>
  )
}
