import React, { useEffect, useRef, useState } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { ProductCard } from '../features/products/components/ProductCard'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Footer } from '../features/footer/Footer'
import { Introduce } from '../features/introduce/Introduce'
import { Features } from '../features/introduce/Features'
import AIChat from '../components/AIChat'
import { Stack, Typography, Button, Box, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, selectWishlistItems } from '../features/wishlist/WishlistSlice'
import { selectLoggedInUser } from '../features/auth/AuthSlice'

export const HomePage = () => {
  const dispatch = useDispatch()
  const addressStatus = useSelector(selectAddressStatus)
  const [aiProducts, setAIProducts] = useState([])
  const [isAISearch, setIsAISearch] = useState(false)
  const navigate = useNavigate()

  const loggedInUser = useSelector(selectLoggedInUser)
  const wishlistItems = useSelector(selectWishlistItems)

  const productRef = useRef(null)
  const featureRef = useRef(null)

  useEffect(() => {
    if (addressStatus === 'fulfilled') {
      dispatch(resetAddressStatus())
    }
  }, [addressStatus])

  const scrollToProducts = () => {
    productRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToFeatures = () => {
    featureRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleProductsFound = (products) => {
    setAIProducts(products)
    setIsAISearch(true)
    setTimeout(() => scrollToProducts(), 300)
  }

  const handleClearAISearch = () => {
    setAIProducts([])
    setIsAISearch(false)
  }

  const handleAddRemoveFromWishlist = (e, productId) => {
    if (e.target.checked) {
      dispatch(createWishlistItemAsync({ user: loggedInUser?._id, product: productId }))
    } else {
      const index = wishlistItems.findIndex((item) => item.product._id === productId)
      if (index !== -1) dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id))
    }
  }

  return (
    <>
      <Navbar isProductList={true} />

      <Introduce
        onScrollToProducts={scrollToProducts}
        onScrollToFeatures={scrollToFeatures}
      />

      <Box ref={productRef}>
        {isAISearch && aiProducts.length > 0 ? (
          <Stack mb={'3rem'}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mx={2} my={2}>
              <Stack>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0369a1' }}>
                  Kết quả từ AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {aiProducts.length} sản phẩm được gợi ý dựa trên tìm kiếm của bạn
                </Typography>
              </Stack>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleClearAISearch}
                sx={{ textTransform: 'none' }}
              >
                Xem tất cả
              </Button>
            </Stack>

            <Grid container spacing={3} sx={{ padding: '0 1rem' }}>
              {aiProducts.map((product, idx) => (
                <Grid item sm={6} md={4} lg={3} xl={3} key={idx} sx={{ display: 'flex' }}>
                  <ProductCard
                    id={product.id}
                    title={product.name || product.title}
                    thumbnail={product.thumbnail}
                    price={product.price}
                    stockQuantity={product.availability?.includes('Còn') ? 1 : 0}
                    handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                  />
                </Grid>
              ))}
            </Grid>
          </Stack>
        ) : (
          <ProductList />
        )}
      </Box>

      <Box ref={featureRef}>
        <Features />
      </Box>

      <AIChat onProductsFound={handleProductsFound} />

      <Footer />
    </>
  )
}