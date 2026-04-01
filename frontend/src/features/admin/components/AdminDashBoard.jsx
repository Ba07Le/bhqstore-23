import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup'
import AddIcon from '@mui/icons-material/Add'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import ClearIcon from '@mui/icons-material/Clear'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { ITEMS_PER_PAGE } from '../../../constants'
import {
  productSortOptions,
  stockFilterOptions,
  visibilityFilterOptions,
} from '../adminConfig'
import { getStockMeta, getVisibilityMeta } from '../adminHelpers'
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import {
  getOrderOverviewAsync,
  selectOrderOverview,
  selectOrderStatsStatus,
} from '../../order/OrderSlice'
import {
  deleteProductByIdAsync,
  fetchProductsAsync,
  selectProductFetchStatus,
  selectProductIsFilterOpen,
  selectProductTotalResults,
  selectProducts,
  toggleFilters,
  undeleteProductByIdAsync,
} from '../../products/ProductSlice'
import { formatCurrency } from '../../../utils/formatCurrency'
import { getImageUrl } from '../../../utils/imageUrl'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminCommerceOverview } from './AdminCommerceOverview'
import { AdminMetricCard } from './AdminMetricCard'
import { AdminSurface } from './AdminSurface'

export const AdminDashBoard = () => {
  const [analyticsRange, setAnalyticsRange] = useState('30d')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState(productSortOptions[0])
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [stockStatus, setStockStatus] = useState('all')
  const [deleteStatus, setDeleteStatus] = useState('all')

  const dispatch = useDispatch()
  const theme = useTheme()

  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)
  const products = useSelector(selectProducts)
  const totalResults = useSelector(selectProductTotalResults)
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen)
  const productFetchStatus = useSelector(selectProductFetchStatus)
  const analytics = useSelector(selectOrderOverview)
  const orderStatsStatus = useSelector(selectOrderStatsStatus)

  const is500 = useMediaQuery(theme.breakpoints.down(500))
  const is700 = useMediaQuery(theme.breakpoints.down(700))
  const is1200 = useMediaQuery(theme.breakpoints.down(1200))
  const is488 = useMediaQuery(theme.breakpoints.down(488))

  useEffect(() => {
    setPage(1)
  }, [searchQuery, stockStatus, deleteStatus, filters.brand, filters.category])

  useEffect(() => {
    dispatch(getOrderOverviewAsync({ range: analyticsRange }))
  }, [analyticsRange, dispatch])

  useEffect(() => {
    const payload = {
      ...filters,
      admin: true,
      pagination: { page, limit: ITEMS_PER_PAGE },
      sort,
    }

    if (searchQuery.trim()) {
      payload.search = searchQuery.trim()
    }

    if (stockStatus !== 'all') {
      payload.stockStatus = stockStatus
    }

    if (deleteStatus === 'active') {
      payload.isDeleted = false
    } else if (deleteStatus === 'deleted') {
      payload.isDeleted = true
    }

    dispatch(fetchProductsAsync(payload))
  }, [dispatch, filters, sort, page, searchQuery, stockStatus, deleteStatus])

  const handleBrandFilters = (event) => {
    const nextValues = new Set(filters.brand || [])
    if (event.target.checked) {
      nextValues.add(event.target.value)
    } else {
      nextValues.delete(event.target.value)
    }
    setFilters({ ...filters, brand: [...nextValues] })
  }

  const handleCategoryFilters = (event) => {
    const nextValues = new Set(filters.category || [])
    if (event.target.checked) {
      nextValues.add(event.target.value)
    } else {
      nextValues.delete(event.target.value)
    }
    setFilters({ ...filters, category: [...nextValues] })
  }

  const handleFilterClose = () => dispatch(toggleFilters())

  const refreshOverview = () => dispatch(getOrderOverviewAsync({ range: analyticsRange }))

  const handleDelete = (id) =>
    dispatch(deleteProductByIdAsync(id)).then(() => {
      refreshOverview()
    })

  const handleUnDelete = (id) =>
    dispatch(undeleteProductByIdAsync(id)).then(() => {
      refreshOverview()
    })

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setSearchQuery(searchInput.trim())
  }

  const handleResetAllFilters = () => {
    setFilters({})
    setSearchInput('')
    setSearchQuery('')
    setStockStatus('all')
    setDeleteStatus('all')
    setSort(productSortOptions[0])
    setPage(1)
  }

  const visibleStats = useMemo(() => {
    const lowStockCount = products.filter(
      (product) => product.stockQuantity > 0 && product.stockQuantity <= 20
    ).length
    const outOfStockCount = products.filter((product) => product.stockQuantity <= 0).length
    const deletedCount = products.filter((product) => product.isDeleted).length
    const activeCount = products.filter((product) => !product.isDeleted).length

    return [
      {
        label: 'Listing dang hien thi',
        value: products.length,
        helper: `Trong tong ${totalResults} ket qua phu hop`,
        icon: <Inventory2OutlinedIcon color="primary" />,
      },
      {
        label: 'San pham sap het',
        value: lowStockCount,
        helper: 'Muc ton kho tu 1 den 20',
        icon: <WarningAmberRoundedIcon sx={{ color: '#ed6c02' }} />,
      },
      {
        label: 'San pham het hang',
        value: outOfStockCount,
        helper: 'Can bo sung de tranh mat doanh thu',
        icon: <DeleteOutlineRoundedIcon sx={{ color: '#d32f2f' }} />,
      },
      {
        label: 'San pham dang ban',
        value: activeCount,
        helper: `${deletedCount} listing dang tam an`,
        icon: <StorefrontOutlinedIcon sx={{ color: '#2e7d32' }} />,
      },
    ]
  }, [products, totalResults])

  const priorityQueue = useMemo(
    () =>
      products
        .filter(
          (product) =>
            product.stockQuantity <= 0 ||
            product.stockQuantity <= 20 ||
            product.isDeleted
        )
        .slice(0, 4),
    [products]
  )

  const hasActiveFilters =
    Boolean(searchQuery) ||
    stockStatus !== 'all' ||
    deleteStatus !== 'all' ||
    Boolean((filters.brand || []).length) ||
    Boolean((filters.category || []).length) ||
    sort !== productSortOptions[0]

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          backgroundColor: '#fff',
          height: '100vh',
          padding: '1rem',
          overflowY: 'auto',
          width: is500 ? '100vw' : '30rem',
          zIndex: 1500,
          top: 0,
          boxShadow: '0 20px 80px rgba(15,23,42,0.22)',
        }}
        variants={{ show: { left: 0 }, hide: { left: -520 } }}
        initial="hide"
        animate={isProductFilterOpen ? 'show' : 'hide'}
      >
        <Stack mb={6}>
          <Typography variant="h5" fontWeight={800}>
            Bo loc nang cao
          </Typography>
          <Typography mt={1} color="text.secondary">
            Chon nhanh brand va danh muc de thu hep danh sach listing can thao tac.
          </Typography>

          <IconButton
            onClick={handleFilterClose}
            sx={{ position: 'absolute', top: 15, right: 15 }}
          >
            <ClearIcon />
          </IconButton>

          <Stack mt={3}>
            <Accordion elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography fontWeight={700}>Thuong hieu</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={handleBrandFilters}>
                  {brands?.map((brand) => (
                    <FormControlLabel
                      key={brand._id}
                      sx={{ ml: 1 }}
                      control={<Checkbox checked={(filters.brand || []).includes(brand._id)} />}
                      label={brand.name}
                      value={brand._id}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Stack mt={2}>
            <Accordion elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<AddIcon />}>
                <Typography fontWeight={700}>Danh muc</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={handleCategoryFilters}>
                  {categories?.map((category) => (
                    <FormControlLabel
                      key={category._id}
                      sx={{ ml: 1 }}
                      control={
                        <Checkbox checked={(filters.category || []).includes(category._id)} />
                      }
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

      <Stack rowGap={4} mb="2rem" px={is488 ? 0 : 0.5}>
        <AdminCommerceOverview
          analytics={analytics}
          orderStatsStatus={orderStatsStatus}
          analyticsRange={analyticsRange}
          onAnalyticsRangeChange={setAnalyticsRange}
        />

        <AdminSurface
          title="Product Operation Desk"
          description="Quan ly danh muc san pham theo kieu seller center: tim nhanh listing, theo doi ton kho va xu ly thao tac ngay tai bang."
          actions={
            <Stack direction={is500 ? 'column' : 'row'} gap={1.2}>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<TuneRoundedIcon />}
                onClick={() => dispatch(toggleFilters())}
              >
                Bo loc nang cao
              </Button>
              <Button
                component={Link}
                to="/admin/add-product"
                variant="contained"
                startIcon={<AddBoxRoundedIcon />}
              >
                Dang san pham moi
              </Button>
            </Stack>
          }
        />

        <Grid container spacing={2}>
          {visibleStats.map((item) => (
            <Grid key={item.label} item xs={12} sm={6} xl={3}>
              <AdminMetricCard
                label={item.label}
                value={item.value}
                helper={item.helper}
                icon={item.icon}
                sx={{ minHeight: 156 }}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <AdminSurface>
              <Stack
                component="form"
                onSubmit={handleSearchSubmit}
                direction={is1200 ? 'column' : 'row'}
                gap={2}
              >
                <TextField
                  fullWidth
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Tim theo ten san pham, brand hoac ma listing"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Sap xep</InputLabel>
                  <Select
                    label="Sap xep"
                    value={sort.name}
                    onChange={(event) =>
                      setSort(
                        productSortOptions.find((option) => option.name === event.target.value) ||
                          productSortOptions[0]
                      )
                    }
                  >
                    {productSortOptions.map((option) => (
                      <MenuItem key={option.name} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Ton kho</InputLabel>
                  <Select
                    label="Ton kho"
                    value={stockStatus}
                    onChange={(event) => setStockStatus(event.target.value)}
                  >
                    {stockFilterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Trang thai</InputLabel>
                  <Select
                    label="Trang thai"
                    value={deleteStatus}
                    onChange={(event) => setDeleteStatus(event.target.value)}
                  >
                    {visibilityFilterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button type="submit" variant="contained" sx={{ minWidth: is1200 ? '100%' : 124 }}>
                  Tim ngay
                </Button>
              </Stack>

              <Stack mt={2} direction="row" gap={1} flexWrap="wrap">
                <Chip label={`Tong ket qua: ${totalResults}`} color="primary" variant="outlined" />
                {searchQuery ? <Chip label={`Tu khoa: ${searchQuery}`} /> : null}
                {stockStatus !== 'all' ? (
                  <Chip
                    label={`Ton kho: ${
                      stockFilterOptions.find((option) => option.value === stockStatus)?.label
                    }`}
                  />
                ) : null}
                {deleteStatus !== 'all' ? (
                  <Chip
                    label={`Trang thai: ${
                      visibilityFilterOptions.find((option) => option.value === deleteStatus)?.label
                    }`}
                  />
                ) : null}
                {hasActiveFilters ? (
                  <Button size="small" color="inherit" onClick={handleResetAllFilters}>
                    Xoa toan bo bo loc
                  </Button>
                ) : null}
              </Stack>
            </AdminSurface>
          </Grid>

          <Grid item xs={12} lg={4}>
            <AdminSurface title="Hang doi can xu ly" sx={{ height: '100%' }}>
              <Stack rowGap={2}>
                {priorityQueue.length ? (
                  priorityQueue.map((product) => {
                    const stockMeta = getStockMeta(product.stockQuantity)

                    return (
                      <Stack
                        key={product._id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1.5}
                        py={1.2}
                        borderBottom="1px solid"
                        borderColor="divider"
                      >
                        <Stack direction="row" gap={1.2} alignItems="center" minWidth={0}>
                          <Avatar
                            src={getImageUrl(product.thumbnail)}
                            variant="rounded"
                            sx={{ width: 46, height: 46 }}
                          />
                          <Stack minWidth={0}>
                            <Typography fontWeight={700} noWrap>
                              {product.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {product.brand?.name || 'Thuong hieu dang cap nhat'}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Chip
                          size="small"
                          color={product.isDeleted ? 'error' : stockMeta.color}
                          label={product.isDeleted ? 'Tam an' : stockMeta.label}
                        />
                      </Stack>
                    )
                  })
                ) : (
                  <Typography color="text.secondary">
                    Chua co listing nao can uu tien xu ly trong trang hien tai.
                  </Typography>
                )}
              </Stack>
            </AdminSurface>
          </Grid>
        </Grid>

        {productFetchStatus === 'pending' && !products.length ? (
          <AdminSurface sx={{ p: 5 }}>
            <Stack alignItems="center" rowGap={2}>
              <Typography variant="h6" fontWeight={700}>
                Dang dong bo danh sach san pham
              </Typography>
              <Typography color="text.secondary">
                He thong dang tai listing, ton kho va gia ban moi nhat.
              </Typography>
            </Stack>
          </AdminSurface>
        ) : products.length ? (
          <AdminSurface
            sx={{
              p: 0,
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              px={{ xs: 2, md: 3 }}
              py={2}
              gap={1}
              sx={{ bgcolor: '#fff' }}
            >
              <Stack rowGap={0.4}>
                <Typography variant="h6" fontWeight={800}>
                  Danh sach listing
                </Typography>
                <Typography color="text.secondary">
                  Quan ly san pham theo trang thai hien thi, ton kho va hieu qua thao tac.
                </Typography>
              </Stack>

              {productFetchStatus === 'pending' ? (
                <Chip label="Dang cap nhat du lieu" color="warning" variant="outlined" />
              ) : null}
            </Stack>

            {productFetchStatus === 'pending' ? (
              <LinearProgress />
            ) : null}

            <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
              <Table aria-label="admin products table" sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>San pham</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Danh muc</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Gia ban</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Ton kho</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trang thai</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Hieu luc</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Hanh dong
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {products.map((product) => {
                    const stockMeta = getStockMeta(product.stockQuantity)
                    const visibilityMeta = getVisibilityMeta(product)

                    return (
                      <TableRow key={product._id} hover>
                        <TableCell>
                          <Stack direction="row" gap={1.5} alignItems="center" minWidth={250}>
                            <Avatar
                              src={getImageUrl(product.thumbnail)}
                              variant="rounded"
                              sx={{ width: 64, height: 64, borderRadius: 3 }}
                            />
                            <Stack rowGap={0.5} minWidth={0}>
                              <Typography fontWeight={700} noWrap>
                                {product.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {product.brand?.name || 'Thuong hieu dang cap nhat'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {product._id.slice(-8).toUpperCase()}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {product.category?.name || 'Chua gan danh muc'}
                        </TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <Stack rowGap={0.8} minWidth={140}>
                            <Stack direction="row" justifyContent="space-between">
                              <Typography fontWeight={700}>{product.stockQuantity}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {stockMeta.label}
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={stockMeta.progress}
                              color={stockMeta.color}
                              sx={{ height: 8, borderRadius: 999 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {stockMeta.helper}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={stockMeta.label}
                            color={stockMeta.color}
                            variant={stockMeta.color === 'warning' ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={visibilityMeta.label} color={visibilityMeta.color} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction={is700 ? 'column' : 'row'}
                            gap={1}
                            justifyContent="flex-end"
                            alignItems={is700 ? 'stretch' : 'center'}
                          >
                            <Button
                              component={Link}
                              to={`/admin/product-update/${product._id}`}
                              variant="contained"
                              size="small"
                              startIcon={<EditRoundedIcon />}
                            >
                              Cap nhat
                            </Button>
                            {product.isDeleted ? (
                              <Button
                                onClick={() => handleUnDelete(product._id)}
                                variant="outlined"
                                color="success"
                                size="small"
                                startIcon={<StorefrontOutlinedIcon />}
                              >
                                Khoi phuc
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleDelete(product._id)}
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<VisibilityOffRoundedIcon />}
                              >
                                Tam an
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </AdminSurface>
        ) : (
          <AdminEmptyState
            title="Khong co san pham phu hop"
            description="Thu doi tu khoa tim kiem hoac bo bot bo loc de xem them listing."
            actionLabel={hasActiveFilters ? 'Xem toan bo san pham' : undefined}
            onAction={hasActiveFilters ? handleResetAllFilters : undefined}
          />
        )}

        <Stack
          alignSelf={is488 ? 'center' : 'flex-end'}
          rowGap={2}
          p={is488 ? 1 : 0}
        >
          <Pagination
            size={is488 ? 'medium' : 'large'}
            page={page}
            onChange={(event, nextPage) => setPage(nextPage)}
            count={Math.ceil(totalResults / ITEMS_PER_PAGE) || 1}
            variant="outlined"
            shape="rounded"
            siblingCount={0}
            boundaryCount={1}
          />

          <Typography textAlign="center" color="text.secondary">
            Trang {page} dang hien thi {products.length} listing
          </Typography>
        </Stack>
      </Stack>
    </>
  )
}
