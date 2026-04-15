import React from 'react'
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material'
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded'
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded'

import { analyticsRangeOptions } from '../adminConfig'
import { getOrderStatusStyles } from '../adminHelpers'
import { formatCurrency } from '../../../utils/formatCurrency'
import { getImageUrl } from '../../../utils/imageUrl'

export const AdminCommerceOverview = ({
  analytics,
  orderStatsStatus,
  analyticsRange,
  onAnalyticsRangeChange,
}) => {
  const overview = analytics?.overview || {}
  const paymentBreakdown = analytics?.paymentBreakdown || []
  const topProducts = analytics?.topProducts || []
  const topCustomers = analytics?.topCustomers || []
  const recentOrders = analytics?.recentOrders || []
  const inventoryAlerts = analytics?.inventory?.alerts || []
  const revenueSeries = analytics?.revenueSeries || []
  const maxRevenue = Math.max(...revenueSeries.map((item) => item.revenue || 0), 0)
  const labelStep = revenueSeries.length > 18 ? Math.ceil(revenueSeries.length / 8) : 1

  const cards = [
    {
      label: 'Doanh thu',
      value: formatCurrency(overview.grossRevenue || 0),
      helper: `${overview.totalOrders || 0} đơn trong kỳ`,
      icon: <MonetizationOnRoundedIcon fontSize="small" />,
    },
    {
      label: 'Đã giao',
      value: formatCurrency(overview.deliveredRevenue || 0),
      helper: `${overview.deliveredOrders || 0} đơn hoàn tất`,
      icon: <LocalShippingRoundedIcon fontSize="small" />,
    },
    {
      label: 'Khách hàng',
      value: `${overview.customersCount || 0}`,
      helper: `${overview.fulfillmentRate || 0}% tỉ lệ hoàn tất`,
      icon: <Groups2RoundedIcon fontSize="small" />,
    },
    {
      label: 'Giá trị TB',
      value: formatCurrency(overview.averageOrderValue || 0),
      helper: `${overview.cancellationRate || 0}% tỉ lệ hủy`,
      icon: <AutoGraphRoundedIcon fontSize="small" />,
    },
  ]

  if (orderStatsStatus === 'pending' && !analytics) {
    return (
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack alignItems="center" rowGap={1.5}>
          <CircularProgress size={30} />
          <Typography variant="body2" color="text.secondary">Đang tổng hợp dữ liệu...</Typography>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack rowGap={2}>
      {/* Banner Header - Reduced padding and font sizes */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(10,37,64,1) 0%, rgba(17,24,39,1) 55%, rgba(30,64,175,0.9) 100%)',
          color: '#fff',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
          <Stack rowGap={0.5}>
            <Typography variant="h5" fontWeight={800} sx={{ fontSize: '1.25rem' }}>
              Tổng quan kinh doanh
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>
              Xem doanh thu, đơn hàng, khách hàng và sản phẩm bán chạy.
            </Typography>
            <Chip
              label={analytics?.window?.label || '30 ngày gần nhất'}
              size="small"
              sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', height: 20, fontSize: '0.7rem' }}
            />
          </Stack>

          <FormControl
            size="small"
            sx={{
              minWidth: 140,
              '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', fontSize: '0.8rem' },
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)', fontSize: '0.8rem' },
              '& .MuiSvgIcon-root': { color: '#fff' },
            }}
          >
            <InputLabel>Kỳ xem</InputLabel>
            <Select
              label="Kỳ xem"
              value={analyticsRange}
              onChange={(event) => onAnalyticsRangeChange(event.target.value)}
            >
              {analyticsRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8rem' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {orderStatsStatus === 'rejected' && (
        <Alert severity="error" sx={{ py: 0, fontSize: '0.8rem' }}>Lỗi tải dữ liệu.</Alert>
      )}

      {/* Metric Cards - Compact size */}
      <Grid container spacing={1.5}>
        {cards.map((card) => (
          <Grid key={card.label} item xs={6} sm={6} xl={3}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack rowGap={0.2}>
                  <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                    {card.value}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: '#eff6ff',
                    color: '#1d4ed8',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography mt={1} color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {card.helper}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1.5}>
        {/* Revenue Chart Section */}
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={1.5}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                Doanh thu theo kỳ
              </Typography>
              <Box sx={{ overflowX: 'auto', pb: 1 }}>
                <Stack minWidth={Math.max(revenueSeries.length * 28, 300)} direction="row" alignItems="flex-end" gap={0.8} height={150}>
                  {revenueSeries.length ? (
                    revenueSeries.map((item, index) => (
                      <Stack key={item.key} flex={1} alignItems="center" justifyContent="flex-end" rowGap={0.5}>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 20,
                            minHeight: 4,
                            borderRadius: '12px 12px 4px 4px',
                            height: maxRevenue
                              ? `${Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 10 : 4)}%`
                              : '4%',
                            background: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
                          }}
                        />
                        <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>
                          {index % labelStep === 0 || index === revenueSeries.length - 1 ? item.label : ''}
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography sx={{ fontSize: '0.8rem' }} color="text.secondary">Chưa có dữ liệu.</Typography>
                  )}
                </Stack>
              </Box>

              <Stack rowGap={1}>
                {paymentBreakdown.map((item) => {
                  const totalRevenue = overview.grossRevenue || 0
                  const percent = totalRevenue ? (item.revenue / totalRevenue) * 100 : 0
                  return (
                    <Stack key={item.label} rowGap={0.4}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: '0.8rem' }} color="text.secondary">{formatCurrency(item.revenue)}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(percent, item.revenue ? 6 : 0)}
                        sx={{ height: 6, borderRadius: 999, bgcolor: '#eef2ff' }}
                      />
                    </Stack>
                  )
                })}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={1.5}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                Sản phẩm bán chạy
              </Typography>
              {topProducts.length ? (
                topProducts.map((item) => (
                  <Stack key={item.productId} direction="row" justifyContent="space-between" alignItems="center" gap={1.5} py={0.8} borderBottom="1px solid" borderColor="divider">
                    <Stack direction="row" gap={1} alignItems="center">
                      <Avatar src={getImageUrl(item.thumbnail)} variant="rounded" sx={{ width: 36, height: 36 }} />
                      <Stack minWidth={0}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }} noWrap>{item.title}</Typography>
                        <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">{item.brand || 'N/A'}</Typography>
                      </Stack>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatCurrency(item.revenue)}</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">{item.quantity} sp</Typography>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography sx={{ fontSize: '0.8rem' }} color="text.secondary">Chưa có dữ liệu.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={1.5}>
        {/* Recent Orders */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={1.5}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                Đơn hàng mới nhất
              </Typography>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <Stack key={order._id} direction="row" justifyContent="space-between" alignItems="center" gap={1.5} py={1} borderBottom="1px solid" borderColor="divider">
                    <Stack rowGap={0.2}>
                      <Stack direction="row" gap={0.8} alignItems="center">
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>#{order._id.slice(-6).toUpperCase()}</Typography>
                        <Chip size="small" label={order.status} sx={{ ...getOrderStatusStyles(order.status), height: 18, fontSize: '0.65rem' }} />
                      </Stack>
                      <Typography sx={{ fontSize: '0.85rem' }}>{order.customer?.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary" noWrap>
                        {order.firstItemTitle} • {order.itemCount} món
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatCurrency(order.total)}</Typography>
                      <Typography sx={{ fontSize: '0.7rem' }} color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography sx={{ fontSize: '0.8rem' }} color="text.secondary">Chưa có đơn hàng.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Inventory and Customers */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={1.5}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                Cần chú ý
              </Typography>

              {topCustomers.slice(0, 4).map((customer) => (
                <Stack key={customer.customerKey} direction="row" justifyContent="space-between" alignItems="center" gap={1.5} py={0.8} borderBottom="1px solid" borderColor="divider">
                  <Stack direction="row" gap={1} alignItems="center">
                    <Avatar sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', width: 32, height: 32, fontSize: '0.85rem' }}>
                      {customer.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Stack>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{customer.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">{customer.orders} đơn</Typography>
                    </Stack>
                  </Stack>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatCurrency(customer.spent)}</Typography>
                </Stack>
              ))}

              {inventoryAlerts.slice(0, 4).map((product) => (
                <Stack key={product._id} direction="row" justifyContent="space-between" alignItems="center" gap={1.5} py={0.8} borderBottom="1px solid" borderColor="divider">
                  <Stack direction="row" gap={1} alignItems="center">
                    <Avatar src={getImageUrl(product.thumbnail)} variant="rounded" sx={{ width: 32, height: 32 }} />
                    <Stack minWidth={0}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }} noWrap>{product.title}</Typography>
                      <Typography sx={{ fontSize: '0.75rem' }} color="text.secondary">Tồn: {product.stockQuantity}</Typography>
                    </Stack>
                  </Stack>
                  <Chip
                    size="small"
                    color={product.stockQuantity <= 0 ? 'error' : 'warning'}
                    label={product.stockQuantity <= 0 ? 'Hết hàng' : 'Sắp hết'}
                    sx={{ height: 18, fontSize: '0.65rem' }}
                  />
                </Stack>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}