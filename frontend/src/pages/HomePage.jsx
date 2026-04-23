import React, { useEffect, useRef, useState } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Footer } from '../features/footer/Footer'
import { Introduce } from '../features/introduce/Introduce'
import { Features } from '../features/introduce/Features'
import AIChat from '../components/AIChat'
import { Stack, Typography, Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

export const HomePage = () => {
  const dispatch = useDispatch()
  const addressStatus = useSelector(selectAddressStatus)
  const [aiProducts, setAIProducts] = useState([])
  const [isAISearch, setIsAISearch] = useState(false)
  const navigate = useNavigate()

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

  return (
    <>
      <Navbar isProductList={true} />

      <Introduce
        onScrollToProducts={scrollToProducts}
        onScrollToFeatures={scrollToFeatures}
      />

      <Box ref={productRef}>
        {isAISearch && aiProducts.length > 0 && (
          <Stack
            sx={{
              p: 3,
              mb: 4,
              mx: { xs: 2, sm: 4, md: 8, lg: 16 },
              bgcolor: '#f0f9ff',
              borderRadius: 2,
              border: '2px solid #0ea5e9',
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#0369a1' }}>
                  Kết quả từ AI
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sản phẩm được gợi ý dựa trên tìm kiếm của bạn
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

            <Stack spacing={2}>
              {aiProducts.map((product, idx) => (
                <Box
                  key={idx}
                  onClick={() => navigate(`/product-details/${product.id}`)}
                  sx={{
                    p: 2,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid #e0e7ff',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: 2,
                  }}
                >
                  {product.thumbnail && (
                    <Box
                      component="img"
                      src={
                        product.thumbnail.startsWith('http')
                          ? product.thumbnail
                          : `${API_URL}${product.thumbnail}`
                      }
                      alt={product.name}
                      onError={(e) => { e.target.style.display = 'none' }}
                      sx={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <Stack flex={1} justifyContent="space-between" minWidth={0}>
  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
    {product.name || product.title}
  </Typography>
  <Typography
    variant="body2"
    color="text.secondary"
    sx={{
      mt: 0.5,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    }}
  >
    {product.quality_info || product.description}
  </Typography>
  <Stack
    direction="row"
    spacing={1}
    mt={1}
    flexWrap="wrap"
    justifyContent="space-between"
  >
    <Typography variant="body2">
      <strong>Giá:</strong> {product.price}
    </Typography>
    <Typography variant="body2">
      <strong>Đánh giá:</strong> {product.rating}
    </Typography>
    <Typography variant="body2">
      <strong>Tình trạng:</strong> {product.availability}
    </Typography>
  </Stack>
</Stack>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}

        <ProductList />
      </Box>

      <Box ref={featureRef}>
        <Features />
      </Box>

      <AIChat onProductsFound={handleProductsFound} />

      <Footer />
    </>
  )
}