import React, { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Button,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
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
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { orderStatusOptions, paymentFilterOptions } from '../adminConfig'
import {
  getCustomerMeta,
  getCustomerName,
  getOrderAddress,
  getOrderSearchText,
  getOrderStatusStyles,
  getPaymentStatusMeta,
  normalizeText,
} from '../adminHelpers'
import {
  getAllOrdersAsync,
  resetOrderUpdateStatus,
  selectOrderFetchStatus,
  selectOrderUpdateStatus,
  selectOrders,
  updateOrderByIdAsync,
} from '../../order/OrderSlice'
import { formatCurrency } from '../../../utils/formatCurrency'
import { getImageUrl } from '../../../utils/imageUrl'
import { AdminEmptyState } from './AdminEmptyState'
import { AdminMetricCard } from './AdminMetricCard'
import { AdminSurface } from './AdminSurface'

export const AdminOrders = () => {
  const dispatch = useDispatch()
  const orders = useSelector(selectOrders)
  const orderUpdateStatus = useSelector(selectOrderUpdateStatus)
  const orderFetchStatus = useSelector(selectOrderFetchStatus)

  const [editOrderId, setEditOrderId] = useState(null)
  const [draftStatus, setDraftStatus] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả')
  const [paymentFilter, setPaymentFilter] = useState('Tất cả')

  const theme = useTheme()
  const is1200 = useMediaQuery(theme.breakpoints.down(1200))
  const is700 = useMediaQuery(theme.breakpoints.down(700))

  useEffect(() => {
    dispatch(getAllOrdersAsync())
  }, [dispatch])

  useEffect(() => {
    if (orderUpdateStatus === 'fulfilled') {
      toast.success('Trạng thái đơn hàng đã được cập nhật')
    } else if (orderUpdateStatus === 'rejected') {
      toast.error('Không thể cập nhật trạng thái đơn hàng')
    }
  }, [orderUpdateStatus])

  useEffect(() => {
    return () => {
      dispatch(resetOrderUpdateStatus())
    }
  }, [dispatch])

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch = searchTerm
          ? getOrderSearchText(order).includes(searchTerm.trim().toLowerCase())
          : true
        const matchesStatus =
          statusFilter === 'Tất cả'
            ? true
            : normalizeText(order.status) === normalizeText(statusFilter)
        const matchesPayment =
          paymentFilter === 'Tất cả' ? true : order.paymentMode === paymentFilter

        return matchesSearch && matchesStatus && matchesPayment
      }),
    [orders, paymentFilter, searchTerm, statusFilter]
  )

  const statusSummary = useMemo(
    () =>
      orderStatusOptions.map((status) => ({
        label: status,
        count: orders.filter(
          (order) => normalizeText(order.status) === normalizeText(status)
        ).length,
      })),
    [orders]
  )

  const orderMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const processingCount = filteredOrders.filter((order) =>
      normalizeText(order.status).includes('đang chờ xử lý')
    ).length
    const shippingCount = filteredOrders.filter((order) => {
      const normalized = normalizeText(order.status)
      return normalized.includes('đã gửi') || normalized.includes('đang giao hàng')
    }).length
    const deliveredCount = filteredOrders.filter((order) =>
      normalizeText(order.status).includes('đã giao')
    ).length

    return [
      {
        label: 'Đơn đang hiển thị',
        value: filteredOrders.length,
        helper: `${orders.length} đơn hệ thống`,
        icon: <ReceiptLongRoundedIcon color="primary" />,
      },
      {
        label: 'GMV bộ lọc',
        value: formatCurrency(totalRevenue),
        helper: 'Tổng giá trị hiện tại',
        icon: <ShoppingBagRoundedIcon sx={{ color: '#ea580c' }} />,
      },
      {
        label: 'Cần xử lý',
        value: processingCount,
        helper: 'Đơn mới chưa xác nhận',
        icon: <SyncRoundedIcon sx={{ color: '#0284c7' }} />,
      },
      {
        label: 'Vận chuyển',
        value: shippingCount + deliveredCount,
        helper: `${deliveredCount} đã giao`,
        icon: <LocalShippingRoundedIcon sx={{ color: '#16a34a' }} />,
      },
    ]
  }, [filteredOrders, orders.length])

  const hasActiveFilters =
    Boolean(searchTerm.trim()) || statusFilter !== 'Tất cả' || paymentFilter !== 'Tất cả'

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('Tất cả')
    setPaymentFilter('Tất cả')
    setEditOrderId(null)
    setDraftStatus('')
  }

  const handleStartEdit = (order) => {
    setEditOrderId(order._id)
    setDraftStatus(order.status)
  }

  const handleCancelEdit = () => {
    setEditOrderId(null)
    setDraftStatus('')
  }

  const handleSaveStatus = (orderId) => {
    if (!draftStatus) return
    dispatch(updateOrderByIdAsync({ _id: orderId, status: draftStatus }))
    setEditOrderId(null)
    setDraftStatus('')
  }

  return (
    <Stack rowGap={2}> {/* Giảm gap chính */}
      <AdminSurface
        title="Trung tâm điều phối đơn hàng"
        description="Tìm đơn theo mã, khách hàng, địa chỉ hoặc sản phẩm; sau đó cập nhật trạng thái ngay trong bảng vận hành."
        sx={{ p: 2 }} // Thu nhỏ padding surface
      >
        <Stack rowGap={1.5}>
          <Stack direction={is1200 ? 'column' : 'row'} spacing={1.5}>
            <TextField
              fullWidth
              size="small" // Size small
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setEditOrderId(null)
              }}
              placeholder="Tìm theo mã đơn, khách hàng..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { fontSize: '0.875rem' } // Giảm font size
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.875rem' }}>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setEditOrderId(null)
                }}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="Tất cả">Tất cả</MenuItem>
                {orderStatusOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel sx={{ fontSize: '0.875rem' }}>Thanh toán</InputLabel>
              <Select
                value={paymentFilter}
                label="Thanh toán"
                onChange={(event) => {
                  setPaymentFilter(event.target.value)
                  setEditOrderId(null)
                }}
                sx={{ fontSize: '0.875rem' }}
              >
                <MenuItem value="Tất cả">Tất cả</MenuItem>
                {paymentFilterOptions.map((option) => (
                  <MenuItem key={option} value={option} sx={{ fontSize: '0.875rem' }}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ClearRoundedIcon fontSize="small" />}
              onClick={handleClearFilters}
              sx={{ minWidth: is1200 ? '100%' : 160, fontSize: '0.75rem', fontWeight: 700 }}
            >
              LÀM MỚI BỘ LỌC
            </Button>
          </Stack>

          <Stack direction="row" gap={0.5} flexWrap="wrap">
            <Chip
              label={`Đang hiển thị ${filteredOrders.length}/${orders.length} đơn`}
              color="primary"
              variant="outlined"
              size="small"
              sx={{ fontSize: '0.7rem' }}
            />
            {statusSummary.map((item) => (
              <Chip
                key={item.label}
                label={`${item.label}: ${item.count}`}
                size="small"
                sx={{ ...getOrderStatusStyles(item.label), fontSize: '0.7rem' }}
              />
            ))}
          </Stack>
        </Stack>
      </AdminSurface>

      <Grid container spacing={1.5}>
        {orderMetrics.map((item) => (
          <Grid key={item.label} item xs={12} sm={6} xl={3}>
            <AdminMetricCard {...item} compact /> 
          </Grid>
        ))}
      </Grid>

      {orderFetchStatus === 'pending' && !orders.length ? (
        <AdminSurface sx={{ p: 4 }}>
          <Stack alignItems="center" rowGap={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              Đang tải dữ liệu...
            </Typography>
            <LinearProgress sx={{ width: '100%', maxWidth: 200, borderRadius: 1 }} />
          </Stack>
        </AdminSurface>
      ) : orders.length ? (
        filteredOrders.length ? (
          <AdminSurface elevation={0} sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
            {orderFetchStatus === 'pending' && <LinearProgress />}
            <TableContainer>
              <Table size="small"> {/* Table size small để tối ưu không gian */}
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Đơn hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Khách hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Thanh toán</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Giao hàng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Trạng thái</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>Thao tác</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredOrders.map((order) => {
                    const address = getOrderAddress(order.address)
                    const isEditing = editOrderId === order._id
                    const firstItem = order.item?.[0]?.product
                    const itemCount = order.item?.length || 0
                    const paymentStatusMeta = getPaymentStatusMeta(order.paymentStatus)

                    return (
                      <TableRow key={order._id} hover>
                        <TableCell>
                          <Stack>
                            <Typography fontWeight={800} fontSize="0.85rem">
                              #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" gap={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem', bgcolor: '#e2e8f0', color: '#0f172a' }}>
                              {getCustomerName(order).charAt(0).toUpperCase()}
                            </Avatar>
                            <Stack minWidth={0}>
                              <Typography fontWeight={700} fontSize="0.8rem" noWrap>
                                {getCustomerName(order)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                                {getCustomerMeta(order)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" gap={1} alignItems="center" minWidth={180}>
                            <Avatar
                              src={getImageUrl(firstItem?.thumbnail)}
                              variant="rounded"
                              sx={{ width: 40, height: 40, borderRadius: 1.5 }}
                            />
                            <Stack minWidth={0}>
                              <Typography fontWeight={700} fontSize="0.8rem" noWrap sx={{ maxWidth: 120 }}>
                                {firstItem?.title || 'Sản phẩm...'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                {itemCount > 1 ? `+${itemCount - 1} món khác` : '1 món'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack>
                            <Typography fontWeight={800} fontSize="0.8rem">{formatCurrency(order.total)}</Typography>
                            <Typography variant="caption" sx={{ fontSize: '0.65rem', color: paymentStatusMeta.color === 'success' ? 'success.main' : 'warning.main' }}>
                               {paymentStatusMeta.label}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack maxWidth={180}>
                            <Typography fontSize="0.75rem" noWrap fontWeight={500}>
                              {address.street}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                              {address.city}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <FormControl size="small" sx={{ minWidth: 120 }}>
                              <Select
                                value={draftStatus}
                                onChange={(e) => setDraftStatus(e.target.value)}
                                sx={{ fontSize: '0.75rem', height: 32 }}
                              >
                                {orderStatusOptions.map((opt) => (
                                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.75rem' }}>{opt}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip 
                                label={order.status} 
                                size="small" 
                                sx={{ ...getOrderStatusStyles(order.status), fontSize: '0.7rem', height: 24 }} 
                            />
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {isEditing ? (
                            <Stack direction="row" gap={0.5} justifyContent="flex-end">
                              <Button 
                                size="small" 
                                variant="contained" 
                                onClick={() => handleSaveStatus(order._id)}
                                sx={{ fontSize: '0.7rem', px: 1, minWidth: 50 }}
                              >
                                Lưu
                              </Button>
                              <Button 
                                size="small" 
                                onClick={handleCancelEdit}
                                sx={{ fontSize: '0.7rem', minWidth: 50 }}
                              >
                                Hủy
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                              onClick={() => handleStartEdit(order)}
                              sx={{ fontSize: '0.7rem', fontWeight: 700, borderRadius: 1, height: 28 }}
                            >
                              CẬP NHẬT
                            </Button>
                          )}
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
            title="Không tìm thấy đơn hàng"
            description="Thử thay đổi bộ lọc tìm kiếm."
            actionLabel={hasActiveFilters ? 'Xem tất cả' : undefined}
            onAction={handleClearFilters}
          />
        )
      ) : (
        <AdminEmptyState title="Chưa có đơn hàng nào" />
      )}
    </Stack>
  )
}