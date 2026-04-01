import { Button, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { useDispatch, useSelector } from 'react-redux'
import {
  deleteCartItemByIdAsync,
  removeFromGuestCart,
  updateCartItemByIdAsync,
  updateGuestCartQuantity,
} from '../CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { Link } from 'react-router-dom'
import { getImageUrl } from '../../../utils/imageUrl'
import { formatCurrency } from '../../../utils/formatCurrency'

export const CartItem = ({
  id,
  thumbnail,
  title,
  brand,
  price,
  quantity,
  stockQuantity,
  productId,
}) => {
  const dispatch = useDispatch()
  const loggedInUser = useSelector(selectLoggedInUser)
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))
  const is480 = useMediaQuery(theme.breakpoints.down(480))
  const is552 = useMediaQuery(theme.breakpoints.down(552))

  const handleAddQty = () => {
    if (quantity >= stockQuantity) return

    const update = { _id: id, quantity: quantity + 1 }
    if (loggedInUser) {
      dispatch(updateCartItemByIdAsync(update))
    } else {
      dispatch(updateGuestCartQuantity(update))
    }
  }

  const handleRemoveQty = () => {
    if (quantity === 1) {
      handleProductRemove()
      return
    }

    const update = { _id: id, quantity: quantity - 1 }
    if (loggedInUser) {
      dispatch(updateCartItemByIdAsync(update))
    } else {
      dispatch(updateGuestCartQuantity(update))
    }
  }

  const handleProductRemove = () => {
    if (loggedInUser) {
      dispatch(deleteCartItemByIdAsync(id))
    } else {
      dispatch(removeFromGuestCart(id))
    }
  }

  return (
    <Stack
      bgcolor="white"
      component={is900 ? 'div' : Paper}
      p={is900 ? 0 : 2}
      elevation={1}
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
    >
      <Stack
        flexDirection="row"
        rowGap="1rem"
        alignItems="center"
        columnGap={2}
        flexWrap="wrap"
      >
        <Stack
          width={is552 ? 'auto' : '200px'}
          height={is552 ? 'auto' : '200px'}
          component={Link}
          to={`/product-details/${productId}`}
        >
          <img
            style={{
              width: '100%',
              height: is552 ? 'auto' : '100%',
              aspectRatio: is552 ? '1 / 1' : undefined,
              objectFit: 'contain',
            }}
            src={getImageUrl(thumbnail)}
            alt={title}
          />
        </Stack>

        <Stack>
          <Typography
            component={Link}
            to={`/product-details/${productId}`}
            sx={{ textDecoration: 'none', color: theme.palette.primary.main }}
            variant="h6"
            fontWeight={500}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {brand}
          </Typography>
          <Typography mt={1}>Số lượng</Typography>
          <Stack flexDirection="row" alignItems="center">
            <IconButton onClick={handleRemoveQty}>
              <RemoveIcon fontSize="small" />
            </IconButton>
            <Typography>{quantity}</Typography>
            <IconButton onClick={handleAddQty} disabled={quantity >= stockQuantity}>
              <AddIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Stack>

      <Stack justifyContent="space-evenly" alignSelf={is552 ? 'flex-end' : ''} height="100%" rowGap="1rem" alignItems="flex-end">
        <Typography variant="body2">{formatCurrency(price)}</Typography>
        <Button size={is480 ? 'small' : 'medium'} onClick={handleProductRemove} variant="contained">
          Xóa
        </Button>
      </Stack>
    </Stack>
  )
}
