import {
  FormHelperText,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder'
import Favorite from '@mui/icons-material/Favorite'
import Checkbox from '@mui/material/Checkbox'
import { useDispatch, useSelector } from 'react-redux'
import { selectWishlistItems } from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { addToCartAsync, addToGuestCart, selectCartItems } from '../../cart/CartSlice'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { getImageUrl } from '../../../utils/imageUrl'
import { formatCurrency } from '../../../utils/formatCurrency'

export const ProductCard = ({
  id,
  title,
  price,
  thumbnail,
  brand,
  stockQuantity,
  handleAddRemoveFromWishlist,
  isWishlistCard,
  isAdminCard,
}) => {
  const navigate = useNavigate()
  const wishlistItems = useSelector(selectWishlistItems)
  const loggedInUser = useSelector(selectLoggedInUser)
  const cartItems = useSelector(selectCartItems)
  const dispatch = useDispatch()

  const theme = useTheme()
  const is1410 = useMediaQuery(theme.breakpoints.down(1410))
  const is932 = useMediaQuery(theme.breakpoints.down(932))
  const is752 = useMediaQuery(theme.breakpoints.down(752))
  const is608 = useMediaQuery(theme.breakpoints.down(608))
  const is488 = useMediaQuery(theme.breakpoints.down(488))
  const is408 = useMediaQuery(theme.breakpoints.down(408))

  const isProductAlreadyinWishlist = wishlistItems.some(
    (item) => item?.product?._id === id
  )
  const isProductAlreadyInCart = cartItems.some((item) => item?.product?._id === id)

  const handleAddToCart = (e) => {
    e.stopPropagation()

    const productData = {
      _id: id,
      title,
      price,
      thumbnail,
      stockQuantity,
      brand: { name: brand },
    }

    if (loggedInUser) {
      dispatch(addToCartAsync({ user: loggedInUser._id, product: id }))
    } else {
      dispatch(addToGuestCart(productData))
    }
  }

  const handleWishlistChange = (e) => {
    e.stopPropagation()

    if (!loggedInUser) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích')
      navigate('/login')
      return
    }

    handleAddRemoveFromWishlist?.(e, id)
  }

  return (
    <Stack
      component={isAdminCard ? 'div' : Paper}
      elevation={isAdminCard ? 0 : 1}
      p={2}
      onClick={() => navigate(`/product-details/${id}`)}
      sx={{
        cursor: 'pointer',
        width: is408
          ? 'auto'
          : is488
            ? '200px'
            : is608
              ? '240px'
              : is752
                ? '300px'
                : is932
                  ? '240px'
                  : is1410
                    ? '300px'
                    : '340px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        transition: 'transform 0.2s',
        '&:hover': { transform: isAdminCard ? 'none' : 'scale(1.01)' },
      }}
    >
      <Stack sx={{ width: '100%', aspectRatio: '1/1', mb: 2, flexShrink: 0 }}>
        <img
          width="100%"
          height="100%"
          style={{ objectFit: 'contain' }}
          src={getImageUrl(thumbnail)}
          alt={title}
          onError={(e) => {
            e.currentTarget.src = '/no-image.png'
          }}
        />
      </Stack>

      <Stack spacing={1} flexGrow={1}>
        <Stack flexDirection="row" alignItems="flex-start" justifyContent="space-between">
          <Typography
            variant="h6"
            fontWeight={500}
            sx={{
              fontSize: is488 ? '0.9rem' : '1.1rem',
              lineHeight: 1.2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {title}
          </Typography>

          {!isAdminCard && (
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
              <Checkbox
                onClick={(e) => e.stopPropagation()}
                checked={loggedInUser ? isProductAlreadyinWishlist : false}
                onChange={handleWishlistChange}
                icon={<FavoriteBorder />}
                checkedIcon={<Favorite sx={{ color: 'red' }} />}
              />
            </motion.div>
          )}
        </Stack>

        <Typography variant="body2" color="text.secondary">
          {brand}
        </Typography>
      </Stack>

      <Stack mt="auto" pt={2}>
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {formatCurrency(price)}
          </Typography>

          {!isAdminCard && !isWishlistCard && (
            isProductAlreadyInCart ? (
              <Typography
                variant="caption"
                sx={{ color: 'success.main', fontWeight: 600 }}
              >
                Da co trong gio
              </Typography>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddToCart}
                disabled={stockQuantity <= 0}
                style={{
                  padding: is408 ? '6px 10px' : '10px 15px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: stockQuantity <= 0 ? 'not-allowed' : 'pointer',
                  backgroundColor: stockQuantity <= 0 ? '#cfcfcf' : 'black',
                  color: stockQuantity <= 0 ? '#666' : 'white',
                  fontSize: is488 ? '0.7rem' : '0.85rem',
                  fontWeight: 600,
                }}
              >
                Them vao gio
              </motion.button>
            )
          )}
        </Stack>

        {stockQuantity <= 20 && stockQuantity > 0 && (
          <FormHelperText error sx={{ mt: 1 }}>
            {stockQuantity === 1 ? 'Chi con 1 san pham' : 'So luong co han'}
          </FormHelperText>
        )}
        {stockQuantity <= 0 && (
          <FormHelperText error sx={{ mt: 1 }}>
            Het hang
          </FormHelperText>
        )}
      </Stack>
    </Stack>
  )
}
