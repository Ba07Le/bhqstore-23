import { Box, Button, Grid, IconButton, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useDispatch,useSelector} from 'react-redux'
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistFetchStatus,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  resetWishlistItemUpdateStatus,
  selectWishlistFetchStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItemUpdateStatus,
  selectWishlistItems,
  updateWishlistItemByIdAsync
} from '../WishlistSlice'
import {ProductCard} from '../../products/components/ProductCard'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { emptyWishlistAnimation, loadingAnimation } from '../../../assets';
import Lottie from 'lottie-react' 
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useForm } from "react-hook-form"
import {
  addToCartAsync,
  resetCartItemAddStatus,
  selectCartItemAddStatus,
  selectCartItems
} from '../../cart/CartSlice'
import { motion } from 'framer-motion';

export const Wishlist = () => {

  const dispatch = useDispatch()

  const wishlistItems = useSelector(selectWishlistItems)
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)
  const wishlistItemUpdateStatus = useSelector(selectWishlistItemUpdateStatus)
  const loggedInUser = useSelector(selectLoggedInUser)
  const cartItems = useSelector(selectCartItems)
  const cartItemAddStatus = useSelector(selectCartItemAddStatus)
  const wishlistFetchStatus = useSelector(selectWishlistFetchStatus)

  /* ===================== FIX NULL PRODUCT ===================== */
  const validWishlistItems = wishlistItems.filter(
    item => item?.product && item.product._id
  )
  /* ============================================================ */

  const [editIndex,setEditIndex] = useState(-1)
  const [editValue,setEditValue] = useState('')
  const {register,handleSubmit,watch,formState: { errors }} = useForm()

  const theme = useTheme()
  const is1130 = useMediaQuery(theme.breakpoints.down(1130))
  const is642 = useMediaQuery(theme.breakpoints.down(642))
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      const data = { user: loggedInUser?._id, product: productId }
      dispatch(createWishlistItemAsync(data))
    } else {
      const index = validWishlistItems.findIndex(
        item => item.product._id === productId
      )
      if (index !== -1) {
        dispatch(deleteWishlistItemByIdAsync(validWishlistItems[index]._id))
      }
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    if (wishlistItemAddStatus === 'fulfilled') toast.success("Sản phẩm được thêm vào mục yêu thích")
    else if (wishlistItemAddStatus === 'rejected') toast.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích")
  }, [wishlistItemAddStatus])

  useEffect(() => {
    if (wishlistItemDeleteStatus === 'fulfilled') toast.success("Sản phẩm được xóa khỏi mục yêu thích")
    else if (wishlistItemDeleteStatus === 'rejected') toast.error("Lỗi khi xóa sản phẩm khỏi danh sách yêu thích")
  }, [wishlistItemDeleteStatus])

  useEffect(() => {
    if (wishlistItemUpdateStatus === 'fulfilled') toast.success("Mục được yêu thích đã được cập nhật")
    else if (wishlistItemUpdateStatus === 'rejected') toast.error("Lỗi khi cập nhật mục trong danh sách yêu thích")
    setEditIndex(-1)
    setEditValue("")
  }, [wishlistItemUpdateStatus])

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') toast.success("Sản phẩm đã được thêm vào giỏ hàng")
    else if (cartItemAddStatus === 'rejected') toast.error("Lỗi khi thêm sản phẩm vào giỏ hàng")
  }, [cartItemAddStatus])

  useEffect(() => {
    if (wishlistFetchStatus === 'rejected') {
      toast.error("Lỗi khi tải danh sách yêu thích")
    }
  }, [wishlistFetchStatus])

  useEffect(() => {
    return () => {
      dispatch(resetWishlistFetchStatus())
      dispatch(resetCartItemAddStatus())
      dispatch(resetWishlistItemUpdateStatus())
      dispatch(resetWishlistItemDeleteStatus())
      dispatch(resetWishlistItemAddStatus())
    }
  }, [])

  const handleNoteUpdate = (wishlistItemId) => {
    dispatch(updateWishlistItemByIdAsync({_id: wishlistItemId, note: editValue}))
  }

  const handleEdit = (index) => {
    setEditValue(validWishlistItems[index].note)
    setEditIndex(index)
  }

  const handleAddToCart = (productId) => {
    dispatch(addToCartAsync({ user: loggedInUser?._id, product: productId }))
  }

  return (
    <Stack justifyContent="flex-start" mt={is480?3:5} mb="14rem" alignItems="center">
      {
        wishlistFetchStatus === 'pending' ? (
          <Stack height="calc(100vh - 4rem)" justifyContent="center">
            <Lottie animationData={loadingAnimation}/>
          </Stack>
        ) : (
          <Stack width={is1130?"auto":"70rem"} rowGap={4}>
            <Stack flexDirection="row" alignItems="center">
              <IconButton component={Link} to="/">
                <ArrowBackIcon/>
              </IconButton>
              <Typography variant="h4">Danh sách yêu thích</Typography>
            </Stack>

            {
              validWishlistItems.length === 0 ? (
                <Stack minHeight="60vh" alignItems="center">
                  <Lottie animationData={emptyWishlistAnimation}/>
                  <Typography>Không có sản phẩm nào được yêu thích</Typography>
                </Stack>
              ) : (
                <Grid container gap={1} justifyContent="center">
                  {validWishlistItems.map((item,index)=>(
                    <Stack key={item._id} component={Paper} elevation={1}>
                      <ProductCard
                        id={item.product._id}
                        title={item.product.title}
                        price={item.product.price}
                        stockQuantity={item.product.stockQuantity}
                        thumbnail={item.product.thumbnail}
                        brand={item.product.brand?.name}
                        handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                        isWishlistCard
                      />

                      <Stack p={2}>
                        <Stack flexDirection="row">
                          <Typography>Thêm ghi chú</Typography>
                          <IconButton onClick={()=>handleEdit(index)}>
                            <EditOutlinedIcon/>
                          </IconButton>
                        </Stack>

                        {editIndex === index ? (
                          <>
                            <TextField multiline rows={4} value={editValue} onChange={e=>setEditValue(e.target.value)} />
                            <Button onClick={()=>handleNoteUpdate(item._id)}>Cập nhật</Button>
                          </>
                        ) : (
                          <Typography>{item.note}</Typography>
                        )}

                        {
                          cartItems.some(
                            cartItem => cartItem?.product?._id === item.product._id
                          )
                          ? <Button component={Link} to="/cart">Đã trong giỏ hàng</Button>
                          : <Button onClick={()=>handleAddToCart(item.product._id)}>Thêm vào giỏ</Button>
                        }
                      </Stack>
                    </Stack>
                  ))}
                </Grid>
              )
            }
          </Stack>
        )
      }
    </Stack>
  )
}
