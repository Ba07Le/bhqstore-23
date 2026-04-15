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
  FormGroup,
} from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Checkbox from '@mui/material/Checkbox'
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
import PaginationItem from '@mui/material/PaginationItem';

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
        label: 'Listing đang hiển thị',
        value: products.length,
        helper: `Tổng ${totalResults} kết quả`,
        icon: <Inventory2OutlinedIcon fontSize="small" color="primary" />,
      },
      {
        label: 'Sản phẩm sắp hết',
        value: lowStockCount,
        helper: 'Kho từ 1 đến 20',
        icon: <WarningAmberRoundedIcon fontSize="small" sx={{ color: '#ed6c02' }} />,
      },
      {
        label: 'Sản phẩm hết hàng',
        value: outOfStockCount,
        helper: 'Cần bổ sung hàng',
        icon: <DeleteOutlineRoundedIcon fontSize="small" sx={{ color: '#d32f2f' }} />,
      },
      {
        label: 'Sản phẩm đang bán',
        value: activeCount,
        helper: `${deletedCount} listing tạm ẩn`,
        icon: <StorefrontOutlinedIcon fontSize="small" sx={{ color: '#2e7d32' }} />,
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
          width: is500 ? '100vw' : '26rem',
          zIndex: 1500,
          top: 0,
          boxShadow: '0 20px 80px rgba(15,23,42,0.22)',
        }}
        variants={{ show: { left: 0 }, hide: { left: -520 } }}
        initial="hide"
        animate={isProductFilterOpen ? 'show' : 'hide'}
      >
        <Stack mb={4}>
          <Typography variant="h6" fontWeight={800}>
            Bộ lọc nâng cao
          </Typography>
          <Typography variant="body2" mt={0.5} color="text.secondary">
            Thu hẹp danh sách listing cần thao tác.
          </Typography>

          <IconButton
            size="small"
            onClick={handleFilterClose}
            sx={{ position: 'absolute', top: 12, right: 12 }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>

          <Stack mt={2.5}>
            <Accordion elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<AddIcon fontSize="small" />}>
                <Typography variant="body2" fontWeight={700}>Thương hiệu</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={handleBrandFilters}>
                  {brands?.map((brand) => (
                    <FormControlLabel
                      key={brand._id}
                      sx={{ ml: 0.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      control={<Checkbox size="small" checked={(filters.brand || []).includes(brand._id)} />}
                      label={brand.name}
                      value={brand._id}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          </Stack>

          <Stack mt={1.5}>
            <Accordion elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <AccordionSummary expandIcon={<AddIcon fontSize="small" />}>
                <Typography variant="body2" fontWeight={700}>Danh mục</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <FormGroup onChange={handleCategoryFilters}>
                  {categories?.map((category) => (
                    <FormControlLabel
                      key={category._id}
                      sx={{ ml: 0.5, '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                      control={
                        <Checkbox size="small" checked={(filters.category || []).includes(category._id)} />
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

      <Stack rowGap={1.5} mb="1.5rem" px={is488 ? 0 : 0.5}>
        <AdminCommerceOverview
          analytics={analytics}
          orderStatsStatus={orderStatsStatus}
          analyticsRange={analyticsRange}
          onAnalyticsRangeChange={setAnalyticsRange}
        />

        <AdminSurface
          title="Bàn làm việc vận hành"
          description="Quản lý danh mục sản phẩm theo kiểu Seller Center."
          actions={
            <Stack direction={is500 ? 'column' : 'row'} gap={1}>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<TuneRoundedIcon fontSize="small" />}
                onClick={() => dispatch(toggleFilters())}
              >
                Bộ lọc
              </Button>
              <Button
                size="small"
                component={Link}
                to="/admin/add-product"
                variant="contained"
                startIcon={<AddBoxRoundedIcon fontSize="small" />}
              >
                Đăng sản phẩm
              </Button>
            </Stack>
          }
        />

        <Grid container spacing={1.5}>
          {visibleStats.map((item) => (
            <Grid key={item.label} item xs={12} sm={6} xl={3}>
              <AdminMetricCard
                label={item.label}
                value={item.value}
                helper={item.helper}
                icon={item.icon}
                sx={{ minHeight: 120, '& .MuiTypography-h4': { fontSize: '1.5rem' } }}
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
                gap={1.5}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Tìm sản phẩm, brand..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth size="small">
                  <InputLabel>Sắp xếp</InputLabel>
                  <Select
                    label="Sắp xếp"
                    value={sort.name}
                    onChange={(event) =>
                      setSort(
                        productSortOptions.find((option) => option.name === event.target.value) ||
                          productSortOptions[0]
                      )
                    }
                  >
                    {productSortOptions.map((option) => (
                      <MenuItem key={option.name} value={option.name} sx={{ fontSize: '0.875rem' }}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Tồn kho</InputLabel>
                  <Select
                    label="Tồn kho"
                    value={stockStatus}
                    onChange={(event) => setStockStatus(event.target.value)}
                  >
                    {stockFilterOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.875rem' }}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button type="submit" size="small" variant="contained" sx={{ minWidth: is1200 ? '100%' : 100 }}>
                  Tìm
                </Button>
              </Stack>

              <Stack mt={1.5} direction="row" gap={0.8} flexWrap="wrap">
                <Chip size="small" label={`Kết quả: ${totalResults}`} color="primary" variant="outlined" />
                {searchQuery && <Chip size="small" label={`Từ khóa: ${searchQuery}`} />}
                {hasActiveFilters && (
                  <Button size="small" sx={{ fontSize: '0.75rem' }} color="inherit" onClick={handleResetAllFilters}>
                    Xóa lọc
                  </Button>
                )}
              </Stack>
            </AdminSurface>
          </Grid>

          <Grid item xs={12} lg={4}>
            <AdminSurface title="Cần xử lý" sx={{ height: '100%' }}>
              <Stack rowGap={1}>
                {priorityQueue.length ? (
                  priorityQueue.map((product) => {
                    const stockMeta = getStockMeta(product.stockQuantity)
                    return (
                      <Stack
                        key={product._id}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        gap={1}
                        py={0.8}
                        borderBottom="1px solid"
                        borderColor="divider"
                      >
                        <Stack direction="row" gap={1} alignItems="center" minWidth={0}>
                          <Avatar
                            src={getImageUrl(product.thumbnail)}
                            variant="rounded"
                            sx={{ width: 32, height: 32 }}
                          />
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {product.title}
                          </Typography>
                        </Stack>
                        <Chip
                          size="small"
                          sx={{ fontSize: '0.65rem', height: 20 }}
                          color={product.isDeleted ? 'error' : stockMeta.color}
                          label={product.isDeleted ? 'Tạm ẩn' : stockMeta.label}
                        />
                      </Stack>
                    )
                  })
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Chưa có listing ưu tiên.
                  </Typography>
                )}
              </Stack>
            </AdminSurface>
          </Grid>
        </Grid>

        {productFetchStatus === 'pending' && !products.length ? (
          <AdminSurface sx={{ p: 3 }}>
            <Stack alignItems="center" rowGap={1}>
              <Typography variant="body1" fontWeight={700}>Đang đồng bộ dữ liệu...</Typography>
            </Stack>
          </AdminSurface>
        ) : products.length ? (
          <AdminSurface sx={{ p: 0, borderRadius: 3, overflow: 'hidden' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              px={2}
              py={1.5}
              sx={{ bgcolor: '#fff' }}
            >
              <Typography variant="body1" fontWeight={800}>
                Danh sách listing
              </Typography>
              {productFetchStatus === 'pending' && (
                <Chip size="small" label="Đang tải..." color="warning" variant="outlined" />
              )}
            </Stack>

            {productFetchStatus === 'pending' && <LinearProgress sx={{ height: 2 }} />}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, py: 1 }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Giá</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tồn kho</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {products.map((product) => {
                    const stockMeta = getStockMeta(product.stockQuantity)
                    const visibilityMeta = getVisibilityMeta(product)

                    return (
                      <TableRow key={product._id} hover>
                        <TableCell sx={{ py: 1 }}>
                          <Stack direction="row" gap={1} alignItems="center">
                            <Avatar
                              src={getImageUrl(product.thumbnail)}
                              variant="rounded"
                              sx={{ width: 48, height: 48, borderRadius: 1.5 }}
                            />
                            <Stack minWidth={0}>
                              <Typography variant="body2" fontWeight={700} noWrap>
                                {product.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {product.brand?.name}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{formatCurrency(product.price)}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5} sx={{ minWidth: 100 }}>
                            <Typography variant="caption" fontWeight={700}>{product.stockQuantity}</Typography>
                            <LinearProgress
                              variant="determinate"
                              value={stockMeta.progress}
                              color={stockMeta.color}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={visibilityMeta.label} color={visibilityMeta.color} sx={{ fontSize: '0.7rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" gap={0.5} justifyContent="flex-end">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/admin/product-update/${product._id}`}
                              color="primary"
                            >
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => product.isDeleted ? handleUnDelete(product._id) : handleDelete(product._id)}
                              color={product.isDeleted ? 'success' : 'error'}
                            >
                              {product.isDeleted ? <StorefrontOutlinedIcon fontSize="small" /> : <VisibilityOffRoundedIcon fontSize="small" />}
                            </IconButton>
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
          <AdminEmptyState title="Không có kết quả" onAction={handleResetAllFilters} />
        )}

        {/* Customized Pagination Logic */}
        {(() => {
          const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);
          return (
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
              <Typography variant="caption" color="text.secondary">
                Trang {page} / {totalPages}
              </Typography>

              <Pagination
                size="small"
                page={page}
                onChange={(e, p) => setPage(p)}
                count={totalPages || 1}
                shape="rounded"
                renderItem={(item) => {
                  if (totalPages <= 3) {
                    return <PaginationItem {...item} />;
                  }

                  const allowedPages = [1, 2, 3, totalPages];

                  if (
                    item.type === 'page' &&
                    !allowedPages.includes(item.page)
                  ) {
                    if (item.page === 4) {
                      return <PaginationItem {...item} page="..." disabled />;
                    }
                    return null;
                  }

                  return <PaginationItem {...item} />;
                }}
              />
            </Stack>
          );
        })()}
      </Stack>
    </>
  )
} 