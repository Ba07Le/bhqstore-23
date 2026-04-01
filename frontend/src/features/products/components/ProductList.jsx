import {
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Checkbox from '@mui/material/Checkbox'
import AddIcon from '@mui/icons-material/Add'
import ClearIcon from '@mui/icons-material/Clear'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import { motion } from 'framer-motion'
import Lottie from 'lottie-react'
import { toast } from 'react-toastify'

import {
  fetchProductsAsync,
  resetProductFetchStatus,
  selectProductFetchStatus,
  selectProductIsFilterOpen,
  selectProductTotalResults,
  selectProducts,
  toggleFilters,
} from '../ProductSlice'
import { ProductCard } from './ProductCard'
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { ITEMS_PER_PAGE } from '../../../constants'
import {
  createWishlistItemAsync,
  deleteWishlistItemByIdAsync,
  resetWishlistItemAddStatus,
  resetWishlistItemDeleteStatus,
  selectWishlistItemAddStatus,
  selectWishlistItemDeleteStatus,
  selectWishlistItems,
} from '../../wishlist/WishlistSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { banner1, banner2, banner3, banner4, loadingAnimation } from '../../../assets'
import { resetCartItemAddStatus, selectCartItemAddStatus } from '../../cart/CartSlice'
import { ProductBanner } from './ProductBanner'

const sortOptions = [
  { label: 'Mới nhất', sort: 'createdAt', order: 'desc' },
  { label: 'Giá: thấp đến cao', sort: 'price', order: 'asc' },
  { label: 'Giá: cao đến thấp', sort: 'price', order: 'desc' },
]

const bannerImages = [banner1, banner3, banner2, banner4]

export const ProductList = () => {
  const [filters, setFilters] = useState({ brand: [], category: [] })
  const [page, setPage] = useState(1)
  const [sortLabel, setSortLabel] = useState(sortOptions[0].label)
  const [searchParams, setSearchParams] = useSearchParams()

  const theme = useTheme()
  const dispatch = useDispatch()

  const is1200 = useMediaQuery(theme.breakpoints.down(1200))
  const is800 = useMediaQuery(theme.breakpoints.down(800))
  const is700 = useMediaQuery(theme.breakpoints.down(700))
  const is600 = useMediaQuery(theme.breakpoints.down(600))
  const is500 = useMediaQuery(theme.breakpoints.down(500))
  const is488 = useMediaQuery(theme.breakpoints.down(488))

  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)
  const products = useSelector(selectProducts)
  const totalResults = useSelector(selectProductTotalResults)
  const loggedInUser = useSelector(selectLoggedInUser)
  const productFetchStatus = useSelector(selectProductFetchStatus)
  const wishlistItems = useSelector(selectWishlistItems)
  const wishlistItemAddStatus = useSelector(selectWishlistItemAddStatus)
  const wishlistItemDeleteStatus = useSelector(selectWishlistItemDeleteStatus)
  const cartItemAddStatus = useSelector(selectCartItemAddStatus)
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen)

  const keyword = searchParams.get('search')?.trim() || ''
  const selectedSort = useMemo(
    () => sortOptions.find((option) => option.label === sortLabel) || sortOptions[0],
    [sortLabel]
  )

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    setPage(1)
  }, [filters.brand, filters.category, keyword, sortLabel])

  useEffect(() => {
    const finalFilters = {
      ...filters,
      pagination: { page, limit: ITEMS_PER_PAGE },
      sort: selectedSort,
    }

    if (keyword) {
      finalFilters.search = keyword
    }

    if (!loggedInUser?.isAdmin) {
      finalFilters.user = true
    }

    dispatch(fetchProductsAsync(finalFilters))
  }, [dispatch, filters, keyword, loggedInUser?.isAdmin, page, selectedSort])

  const handleBrandFilters = (event) => {
    const nextValues = new Set(filters.brand)
    if (event.target.checked) {
      nextValues.add(event.target.value)
    } else {
      nextValues.delete(event.target.value)
    }

    setFilters((prev) => ({ ...prev, brand: [...nextValues] }))
  }

  const handleCategoryFilters = (event) => {
    const nextValues = new Set(filters.category)
    if (event.target.checked) {
      nextValues.add(event.target.value)
    } else {
      nextValues.delete(event.target.value)
    }

    setFilters((prev) => ({ ...prev, category: [...nextValues] }))
  }

  const handleAddRemoveFromWishlist = (event, productId) => {
    if (event.target.checked) {
      dispatch(createWishlistItemAsync({ user: loggedInUser?._id, product: productId }))
      return
    }

    const index = wishlistItems.findIndex((item) => item?.product?._id === productId)
    if (index !== -1) {
      dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id))
    }
  }

  const handleResetFilters = () => {
    setFilters({ brand: [], category: [] })
    setPage(1)
    setSortLabel(sortOptions[0].label)
  }

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
  }

  useEffect(() => {
    if (wishlistItemAddStatus === 'fulfilled') {
      toast.success('Sản phẩm đã được thêm vào yêu thích')
    } else if (wishlistItemAddStatus === 'rejected') {
      toast.error('Không thể thêm sản phẩm vào danh sách yêu thích')
    }
  }, [wishlistItemAddStatus])

  useEffect(() => {
    if (wishlistItemDeleteStatus === 'fulfilled') {
      toast.success('Sản phẩm đã được xóa khỏi yêu thích')
    } else if (wishlistItemDeleteStatus === 'rejected') {
      toast.error('Không thể xóa sản phẩm khỏi danh sách yêu thích')
    }
  }, [wishlistItemDeleteStatus])

  useEffect(() => {
    if (cartItemAddStatus === 'fulfilled') {
      toast.success('Sản phẩm đã được thêm vào giỏ')
    } else if (cartItemAddStatus === 'rejected') {
      toast.error('Không thể thêm sản phẩm vào giỏ hàng')
    }
  }, [cartItemAddStatus])

  useEffect(() => {
    if (productFetchStatus === 'rejected') {
      toast.error('Không thể tải sản phẩm, vui lòng thử lại sau')
    }
  }, [productFetchStatus])

  useEffect(() => {
    return () => {
      dispatch(resetProductFetchStatus())
      dispatch(resetWishlistItemAddStatus())
      dispatch(resetWishlistItemDeleteStatus())
      dispatch(resetCartItemAddStatus())
    }
  }, [dispatch])

  const hasActiveFilters =
    filters.brand.length > 0 ||
    filters.category.length > 0 ||
    sortLabel !== sortOptions[0].label ||
    Boolean(keyword)

  const currentPageCount = Math.max(
    0,
    Math.min(ITEMS_PER_PAGE, totalResults - (page - 1) * ITEMS_PER_PAGE)
  )

  if (productFetchStatus === 'pending' && !products.length) {
    return (
      <Stack width={is500 ? '35vh' : '25rem'} height="calc(100vh - 4rem)" justifyContent="center" mx="auto">
        <Lottie animationData={loadingAnimation} />
      </Stack>
    )
  }

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          backgroundColor: 'white',
          height: '100vh',
          padding: '1rem',
          overflowY: 'auto',
          width: is500 ? '100vw' : '30rem',
          zIndex: 500,
          boxShadow: '0 12px 40px rgba(20,20,20,0.12)',
        }}
        variants={{ show: { left: 0 }, hide: { left: -500 } }}
        initial="hide"
        transition={{ ease: 'easeInOut', duration: 0.45 }}
        animate={isProductFilterOpen ? 'show' : 'hide'}
      >
        <Stack mb="5rem">
          <Typography variant="h4">Bo loc san pham</Typography>

          <IconButton onClick={() => dispatch(toggleFilters())} sx={{ position: 'absolute', top: 15, right: 15 }}>
            <ClearIcon />
          </IconButton>

          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography>Thuong hieu</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={handleBrandFilters}>
                  {brands?.map((brand) => (
                    <FormControlLabel
                      key={brand._id}
                      sx={{ ml: 1 }}
                      control={<Checkbox checked={filters.brand.includes(brand._id)} />}
                      label={brand.name}
                      value={brand._id}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Stack mt={2}>
            <Accordion>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography>Danh muc</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={handleCategoryFilters}>
                  {categories?.map((category) => (
                    <FormControlLabel
                      key={category._id}
                      sx={{ ml: 1 }}
                      control={<Checkbox checked={filters.category.includes(category._id)} />}
                      label={category.name}
                      value={category._id}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Stack>
      </motion.div>

      <Stack mb="3rem">
        {!is600 && (
          <Stack sx={{ width: '100%', height: is800 ? '300px' : is1200 ? '400px' : '500px' }}>
            <ProductBanner images={bannerImages} />
          </Stack>
        )}

        <Stack rowGap={4} mt={is600 ? 2 : 0} px={is488 ? 1.5 : 2}>
          <Stack
            component={Paper}
            elevation={1}
            sx={{
              p: is488 ? 2 : 3,
              borderRadius: 3,
              mx: is488 ? 0 : 2,
            }}
          >
            <Stack
              direction={is700 ? 'column' : 'row'}
              justifyContent="space-between"
              alignItems={is700 ? 'stretch' : 'center'}
              gap={2}
            >
              <Stack rowGap={0.5}>
                <Typography variant="h5" fontWeight={700}>
                  Khám phá sản phẩm
                </Typography>
                <Typography color="text.secondary">
                  Danh sách được sắp xếp ổn định để bạn dễ theo dõi và mua sắm hơn.
                </Typography>
              </Stack>

              <Stack direction={is488 ? 'column' : 'row'} gap={1.5} alignItems="center">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<TuneRoundedIcon />}
                  onClick={() => dispatch(toggleFilters())}
                >
                  Bộ lọc
                </Button>

                <FormControl sx={{ minWidth: is488 ? '100%' : '14rem' }}>
                  <InputLabel id="sort-dropdown">Sắp xếp</InputLabel>
                  <Select
                    labelId="sort-dropdown"
                    label="Sắp xếp"
                    onChange={(event) => setSortLabel(event.target.value)}
                    value={sortLabel}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.label} value={option.label}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>

            <Stack mt={2} direction="row" gap={1} flexWrap="wrap">
              <Chip label={`Tong ket qua: ${totalResults}`} color="primary" variant="outlined" />
              {keyword ? <Chip label={`Tu khoa: ${keyword}`} onDelete={handleClearSearch} /> : null}
              {filters.brand.length ? <Chip label={`Thuong hieu: ${filters.brand.length}`} /> : null}
              {filters.category.length ? <Chip label={`Danh muc: ${filters.category.length}`} /> : null}
              {hasActiveFilters ? (
                <Button size="small" color="inherit" onClick={handleResetFilters}>
                  Xoa bo loc
                </Button>
              ) : null}
            </Stack>
          </Stack>

          {products.length === 0 ? (
            <Paper elevation={1} sx={{ p: 5, borderRadius: 3, mx: is488 ? 0 : 2 }}>
              <Stack alignItems="center" rowGap={1.5}>
                <Typography variant="h6" fontWeight={700}>
                  Không có sản phẩm phù hợp
                </Typography>
                <Typography color="text.secondary" textAlign="center">
                  Hãy thử đổi từ khóa tìm kiếm, bỏ bớt bộ lọc hoặc quay lại danh sách chung.
                </Typography>
                <Stack direction={is488 ? 'column' : 'row'} gap={1.5}>
                  {keyword ? (
                    <Button variant="outlined" onClick={handleClearSearch}>
                      Xóa từ khóa tìm kiếm
                    </Button>
                  ) : null}
                  <Button variant="contained" onClick={handleResetFilters}>
                    Xem toàn bộ sản phẩm
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Grid gap={is700 ? 1 : 2} container justifyContent="center" alignContent="center">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  id={product._id}
                  title={product.title}
                  thumbnail={product.thumbnail}
                  brand={product.brand?.name || 'Thuong hieu dang cap nhat'}
                  price={product.price}
                  stockQuantity={product.stockQuantity}
                  handleAddRemoveFromWishlist={handleAddRemoveFromWishlist}
                />
              ))}
            </Grid>
          )}

          <Stack
            alignSelf={is488 ? 'center' : 'flex-end'}
            mr={is488 ? 0 : 5}
            rowGap={2}
            p={is488 ? 1 : 0}
          >
            <Pagination
              size={is488 ? 'medium' : 'large'}
              page={page}
              onChange={(event, nextPage) => setPage(nextPage)}
              count={Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE))}
              variant="outlined"
              shape="rounded"
              siblingCount={0}
              boundaryCount={1}
            />

            <Typography textAlign="center">
              Trang {page} có {currentPageCount} sản phẩm
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </>
  )
}
