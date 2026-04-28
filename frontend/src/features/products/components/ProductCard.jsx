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
    tags,
    handleAddRemoveFromWishlist,
    isWishlistCard,
    isAdminCard,
}) => {
    const navigate = useNavigate()
    const wishlistItems = useSelector(selectWishlistItems)
    const loggedInUser = useSelector(selectLoggedInUser)
    const cartItems = useSelector(selectCartItems)
    const dispatch = useDispatch()

    console.log("Dữ liệu brand của sản phẩm", title, ":", brand);

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
            brand: { name: typeof brand === 'object' ? brand?.name : brand },
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
            component={Paper}
            elevation={1}
            p={2}
            onClick={() => navigate(`/product-details/${id}`)}
            sx={{
                cursor: "pointer",
                // Xử lý width linh hoạt nhưng vẫn đảm bảo giãn hết chiều cao
                width: is408 ? '100%' : is488 ? "200px" : is608 ? "240px" : is752 ? "300px" : is932 ? '240px' : is1410 ? "300px" : '340px',
                flexGrow: 1, 
                height: "auto", 
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                transition: "transform 0.2s",
                "&:hover": { transform: isAdminCard ? "none" : "scale(1.01)" }
            }}
        >
            {/* 1. Phần Ảnh (Cố định tỷ lệ 1:1) */}
            <Stack sx={{ width: '100%', aspectRatio: '1/1', mb: 2, flexShrink: 0 }}>
                <img
                    width="100%"
                    height="100%"
                    style={{ objectFit: 'contain' }}
                    src={getImageUrl(thumbnail)}
                    alt={title}
                    onError={(e) => { e.currentTarget.src = '/no-image.png' }}
                />
            </Stack>

            {/* 2. Phần Nội dung (Tên, Thương hiệu, Stock) */}
            <Stack spacing={1} flexGrow={1}>
                <Stack flexDirection="row" alignItems="flex-start" justifyContent="space-between">
                    <Typography
                        variant="h6"
                        fontWeight={500}
                        sx={{
                            fontSize: is488 ? '0.9rem' : '1.1rem',
                            lineHeight: 1.2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2, // Giới hạn 2 dòng
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.4em' // Giữ chỗ cho 2 dòng văn bản ngay cả khi tên ngắn
                        }}
                    >
                        {title}
                    </Typography>

                    {!isAdminCard && !loggedInUser?.isAdmin &&(
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

                    {typeof brand === 'object' ? brand?.name : (brand || 'Thương hiệu')}

                </Typography>

                {/* TAGS */}
{tags?.length > 0 && (
  <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
    {tags.map((tag, index) => (
      <Typography
        key={index}
        sx={{
          fontSize: '0.65rem',
          px: 0.8,
          py: 0.2,
          borderRadius: '6px',
          bgcolor: '#eee',
          color: '#333',
        }}
      >
        {tag}
      </Typography>
    ))}
  </Stack>
)}

                {/* Phần Stock - Giữ chiều cao cố định để không bị giật card */}
                <Stack minHeight="20px">
    {stockQuantity > 20 && (
        <FormHelperText sx={{ mt: 0, fontSize: '0.75rem', color: 'green' }}>
            Còn hàng
        </FormHelperText>
    )}

    {stockQuantity <= 20 && stockQuantity > 0 && (
        <FormHelperText error sx={{ mt: 0, fontSize: '0.75rem' }}>
            {stockQuantity === 1 ? 'Chỉ còn 1 sản phẩm' : 'Số lượng có hạn'}
        </FormHelperText>
    )}

    {stockQuantity <= 0 && (
        <FormHelperText error sx={{ mt: 0, fontSize: '0.75rem' }}>
            Hết hàng
        </FormHelperText>
    )}
</Stack>
            </Stack>

            {/* 3. Phần Giá và Nút (Luôn nằm ở dưới cùng nhờ mt: auto) */}
            <Stack mt="auto" pt={2}>
                <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                        {formatCurrency(price)}
                    </Typography>

                    {!isAdminCard && !isWishlistCard && !loggedInUser?.isAdmin &&(
                        <>
                            {isProductAlreadyInCart ? (
                                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
                                    Đã có trong giỏ hàng
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
                                        color: 'white',
                                        fontSize: is488 ? '0.7rem' : '0.85rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Thêm vào giỏ
                                </motion.button>
                            )}
                        </>
                    )}
                </Stack>
            </Stack>
        </Stack>
    )
}