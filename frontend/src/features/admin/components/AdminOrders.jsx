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
  const [statusFilter, setStatusFilter] = useState('Tat ca')
  const [paymentFilter, setPaymentFilter] = useState('Tat ca')

  const theme = useTheme()
  const is1200 = useMediaQuery(theme.breakpoints.down(1200))
  const is700 = useMediaQuery(theme.breakpoints.down(700))

  useEffect(() => {
    dispatch(getAllOrdersAsync())
  }, [dispatch])

  useEffect(() => {
    if (orderUpdateStatus === 'fulfilled') {
      toast.success('Trang thai don hang da duoc cap nhat')
    } else if (orderUpdateStatus === 'rejected') {
      toast.error('Khong the cap nhat trang thai don hang')
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
          statusFilter === 'Tat ca'
            ? true
            : normalizeText(order.status) === normalizeText(statusFilter)
        const matchesPayment =
          paymentFilter === 'Tat ca' ? true : order.paymentMode === paymentFilter

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
      normalizeText(order.status).includes('dang cho xu ly')
    ).length
    const shippingCount = filteredOrders.filter((order) => {
      const normalized = normalizeText(order.status)
      return normalized.includes('da gui') || normalized.includes('dang giao hang')
    }).length
    const deliveredCount = filteredOrders.filter((order) =>
      normalizeText(order.status).includes('da giao')
    ).length

    return [
      {
        label: 'Don dang hien thi',
        value: filteredOrders.length,
        helper: `${orders.length} don trong he thong`,
        icon: <ReceiptLongRoundedIcon color="primary" />,
      },
      {
        label: 'GMV theo bo loc',
        value: formatCurrency(totalRevenue),
        helper: 'Tong gia tri don hang hien tai',
        icon: <ShoppingBagRoundedIcon sx={{ color: '#ea580c' }} />,
      },
      {
        label: 'Can xu ly ngay',
        value: processingCount,
        helper: 'Don moi chua xac nhan',
        icon: <SyncRoundedIcon sx={{ color: '#0284c7' }} />,
      },
      {
        label: 'Dang van chuyen',
        value: shippingCount + deliveredCount,
        helper: `${deliveredCount} don da giao`,
        icon: <LocalShippingRoundedIcon sx={{ color: '#16a34a' }} />,
      },
    ]
  }, [filteredOrders, orders.length])

  const hasActiveFilters =
    Boolean(searchTerm.trim()) || statusFilter !== 'Tat ca' || paymentFilter !== 'Tat ca'

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('Tat ca')
    setPaymentFilter('Tat ca')
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
    <Stack rowGap={3}>
      <AdminSurface
        title="Order Control Tower"
        description="Tim don theo ma, khach, dia chi hoac san pham; sau do cap nhat trang thai ngay trong bang van hanh."
      >
        <Stack rowGap={2}>
          <Stack direction={is1200 ? 'column' : 'row'} spacing={2}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setEditOrderId(null)
              }}
              placeholder="Tim theo ma don, khach hang, san pham, dia chi"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl fullWidth>
              <InputLabel>Trang thai</InputLabel>
              <Select
                value={statusFilter}
                label="Trang thai"
                onChange={(event) => {
                  setStatusFilter(event.target.value)
                  setEditOrderId(null)
                }}
              >
                <MenuItem value="Tat ca">Tat ca</MenuItem>
                {orderStatusOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Thanh toan</InputLabel>
              <Select
                value={paymentFilter}
                label="Thanh toan"
                onChange={(event) => {
                  setPaymentFilter(event.target.value)
                  setEditOrderId(null)
                }}
              >
                {paymentFilterOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ClearRoundedIcon />}
              onClick={handleClearFilters}
              sx={{ minWidth: is1200 ? '100%' : 180 }}
            >
              Lam moi bo loc
            </Button>
          </Stack>

          <Stack direction="row" gap={1} flexWrap="wrap">
            <Chip
              label={`Dang hien thi ${filteredOrders.length}/${orders.length} don`}
              color="primary"
              variant="outlined"
            />
            {statusSummary.map((item) => (
              <Chip
                key={item.label}
                label={`${item.label}: ${item.count}`}
                sx={getOrderStatusStyles(item.label)}
              />
            ))}
          </Stack>
        </Stack>
      </AdminSurface>

      <Grid container spacing={2}>
        {orderMetrics.map((item) => (
          <Grid key={item.label} item xs={12} sm={6} xl={3}>
            <AdminMetricCard {...item} />
          </Grid>
        ))}
      </Grid>

      {orderFetchStatus === 'pending' && !orders.length ? (
        <AdminSurface sx={{ p: 5 }}>
          <Stack alignItems="center" rowGap={1.5}>
            <Typography variant="h6" fontWeight={700}>
              Dang tai du lieu don hang
            </Typography>
            <Typography color="text.secondary">
              He thong dang tong hop danh sach van hanh moi nhat.
            </Typography>
          </Stack>
        </AdminSurface>
      ) : orders.length ? (
        filteredOrders.length ? (
          <AdminSurface
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            {orderFetchStatus === 'pending' ? <LinearProgress /> : null}

            <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 1180 }} aria-label="admin orders table">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 700 }}>Don hang</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Khach hang</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>San pham</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Thanh toan</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Giao hang</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Trang thai</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      Thao tac
                    </TableCell>
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
                          <Stack rowGap={0.5}>
                            <Typography fontWeight={800}>
                              #{order._id.slice(-8).toUpperCase()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {itemCount} mon trong don
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" gap={1.2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#e2e8f0', color: '#0f172a' }}>
                              {getCustomerName(order).charAt(0).toUpperCase()}
                            </Avatar>
                            <Stack minWidth={0}>
                              <Typography fontWeight={700} noWrap>
                                {getCustomerName(order)}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" noWrap>
                                {getCustomerMeta(order)}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack direction="row" gap={1.2} alignItems="center" minWidth={220}>
                            <Avatar
                              src={getImageUrl(firstItem?.thumbnail)}
                              variant="rounded"
                              sx={{ width: 54, height: 54, borderRadius: 3 }}
                            />
                            <Stack minWidth={0}>
                              <Typography fontWeight={700} noWrap>
                                {firstItem?.title || 'San pham dang cap nhat'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {itemCount > 1 ? `Va ${itemCount - 1} san pham khac` : '1 san pham'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack rowGap={0.5}>
                            <Typography fontWeight={800}>{formatCurrency(order.total)}</Typography>
                            <Stack direction="row" gap={0.8} flexWrap="wrap">
                              <Chip
                                size="small"
                                label={order.paymentMode || 'COD'}
                                variant="outlined"
                                sx={{ alignSelf: 'flex-start' }}
                              />
                              <Chip
                                size="small"
                                color={paymentStatusMeta.color}
                                label={paymentStatusMeta.label}
                                variant={paymentStatusMeta.color === 'warning' ? 'outlined' : 'filled'}
                              />
                            </Stack>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Stack rowGap={0.4} maxWidth={250}>
                            <Typography fontWeight={700} noWrap>
                              {address.street || 'Dia chi dang cap nhat'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {[address.city, address.state].filter(Boolean).join(', ') || 'Chua co thanh pho'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {address.postalCode || 'Chua co ma buu chinh'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Trang thai</InputLabel>
                              <Select
                                value={draftStatus}
                                label="Trang thai"
                                onChange={(event) => setDraftStatus(event.target.value)}
                              >
                                {orderStatusOptions.map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip label={order.status} sx={getOrderStatusStyles(order.status)} />
                          )}
                        </TableCell>

                        <TableCell align="right">
                          {isEditing ? (
                            <Stack
                              direction={is700 ? 'column' : 'row'}
                              gap={1}
                              justifyContent="flex-end"
                            >
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CheckCircleRoundedIcon />}
                                onClick={() => handleSaveStatus(order._id)}
                              >
                                Luu
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="inherit"
                                onClick={handleCancelEdit}
                              >
                                Huy
                              </Button>
                            </Stack>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<EditRoundedIcon />}
                              onClick={() => handleStartEdit(order)}
                            >
                              Cap nhat
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
            title="Khong tim thay don hang phu hop"
            description="Thu thay doi tu khoa tim kiem hoac xoa bot bo loc dang ap dung."
            actionLabel={hasActiveFilters ? 'Xem tat ca don hang' : undefined}
            onAction={hasActiveFilters ? handleClearFilters : undefined}
          />
        )
      ) : (
        <AdminEmptyState
          title="Chua co don hang nao"
          description="Khi co don moi, khu van hanh nay se hien thi toan bo lich su xu ly."
        />
      )}
    </Stack>
  )
}
