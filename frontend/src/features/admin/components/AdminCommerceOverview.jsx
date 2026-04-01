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
      helper: `${overview.totalOrders || 0} don trong ky`,
      icon: <MonetizationOnRoundedIcon />,
    },
    {
      label: 'Da giao',
      value: formatCurrency(overview.deliveredRevenue || 0),
      helper: `${overview.deliveredOrders || 0} don hoan tat`,
      icon: <LocalShippingRoundedIcon />,
    },
    {
      label: 'Khach hang',
      value: `${overview.customersCount || 0}`,
      helper: `${overview.fulfillmentRate || 0}% ti le hoan tat`,
      icon: <Groups2RoundedIcon />,
    },
    {
      label: 'Gia tri TB',
      value: formatCurrency(overview.averageOrderValue || 0),
      helper: `${overview.cancellationRate || 0}% ti le huy`,
      icon: <AutoGraphRoundedIcon />,
    },
  ]

  if (orderStatsStatus === 'pending' && !analytics) {
    return (
      <Paper elevation={0} sx={{ p: 5, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Stack alignItems="center" rowGap={2}>
          <CircularProgress />
          <Typography color="text.secondary">Dang tong hop doanh thu va van hanh...</Typography>
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack rowGap={3}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 5,
          border: '1px solid',
          borderColor: 'divider',
          background:
            'linear-gradient(135deg, rgba(10,37,64,1) 0%, rgba(17,24,39,1) 55%, rgba(30,64,175,0.9) 100%)',
          color: '#fff',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>
          <Stack rowGap={1}>
            <Typography variant="h4" fontWeight={800}>
              Commerce Overview
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Xem doanh thu, don hang, khach hang va san pham ban chay tren cung mot man hinh.
            </Typography>
            <Chip
              label={analytics?.window?.label || '30 ngay gan nhat'}
              size="small"
              sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.12)', color: '#fff' }}
            />
          </Stack>

          <FormControl
            size="small"
            sx={{
              minWidth: 170,
              '& .MuiOutlinedInput-root': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.16)' },
              '& .MuiSvgIcon-root': { color: '#fff' },
            }}
          >
            <InputLabel sx={{ color: 'rgba(255,255,255,0.75)' }}>Ky xem</InputLabel>
            <Select
              label="Ky xem"
              value={analyticsRange}
              onChange={(event) => onAnalyticsRangeChange(event.target.value)}
            >
              {analyticsRangeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {orderStatsStatus === 'rejected' ? (
        <Alert severity="error">Khong tai duoc thong ke doanh thu. Vui long thu lai sau.</Alert>
      ) : null}

      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid key={card.label} item xs={12} sm={6} xl={3}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack rowGap={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    {card.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={800}>
                    {card.value}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: '#eff6ff',
                    color: '#1d4ed8',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography mt={2} color="text.secondary" variant="body2">
                {card.helper}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={2}>
              <Typography variant="h6" fontWeight={700}>
                Doanh thu theo ky
              </Typography>
              <Box sx={{ overflowX: 'auto', pb: 1 }}>
                <Stack minWidth={Math.max(revenueSeries.length * 36, 360)} direction="row" alignItems="flex-end" gap={1} height={220}>
                  {revenueSeries.length ? (
                    revenueSeries.map((item, index) => (
                      <Stack key={item.key} flex={1} alignItems="center" justifyContent="flex-end" rowGap={1}>
                        <Box
                          sx={{
                            width: '100%',
                            maxWidth: 28,
                            minHeight: 8,
                            borderRadius: '16px 16px 6px 6px',
                            height: maxRevenue
                              ? `${Math.max((item.revenue / maxRevenue) * 100, item.revenue ? 10 : 4)}%`
                              : '4%',
                            background:
                              'linear-gradient(180deg, rgba(37,99,235,0.92) 0%, rgba(29,78,216,0.72) 100%)',
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {index % labelStep === 0 || index === revenueSeries.length - 1 ? item.label : ''}
                        </Typography>
                      </Stack>
                    ))
                  ) : (
                    <Typography color="text.secondary">Chua co doanh thu trong ky nay.</Typography>
                  )}
                </Stack>
              </Box>

              <Stack rowGap={1.2}>
                {paymentBreakdown.map((item) => {
                  const totalRevenue = overview.grossRevenue || 0
                  const percent = totalRevenue ? (item.revenue / totalRevenue) * 100 : 0

                  return (
                    <Stack key={item.label} rowGap={0.7}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography fontWeight={600}>{item.label}</Typography>
                        <Typography color="text.secondary">{formatCurrency(item.revenue)}</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(percent, item.revenue ? 6 : 0)}
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: '#eef2ff',
                          '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: '#2563eb' },
                        }}
                      />
                    </Stack>
                  )
                })}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={2}>
              <Typography variant="h6" fontWeight={700}>
                San pham ban chay
              </Typography>
              {topProducts.length ? (
                topProducts.map((item) => (
                  <Stack key={item.productId} direction="row" justifyContent="space-between" alignItems="center" gap={2} py={1.1} borderBottom="1px solid" borderColor="divider">
                    <Stack direction="row" gap={1.5} alignItems="center">
                      <Avatar src={getImageUrl(item.thumbnail)} variant="rounded" sx={{ width: 48, height: 48 }} />
                      <Stack>
                        <Typography fontWeight={700}>{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.brand || 'Thuong hieu dang cap nhat'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography fontWeight={700}>{formatCurrency(item.revenue)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.quantity} sp
                      </Typography>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary">Chua co san pham ban ra trong ky nay.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={2}>
              <Typography variant="h6" fontWeight={700}>
                Don hang moi nhat
              </Typography>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <Stack key={order._id} direction="row" justifyContent="space-between" alignItems="center" gap={2} py={1.2} borderBottom="1px solid" borderColor="divider">
                    <Stack rowGap={0.4}>
                      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                        <Typography fontWeight={700}>#{order._id.slice(-6).toUpperCase()}</Typography>
                        <Chip size="small" label={order.status} sx={getOrderStatusStyles(order.status)} />
                      </Stack>
                      <Typography>{order.customer?.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.firstItemTitle} • {order.itemCount} mon
                      </Typography>
                    </Stack>
                    <Stack alignItems="flex-end">
                      <Typography fontWeight={700}>{formatCurrency(order.total)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Stack>
                  </Stack>
                ))
              ) : (
                <Typography color="text.secondary">Chua co don hang phat sinh.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack rowGap={2}>
              <Typography variant="h6" fontWeight={700}>
                Khach hang va ton kho can chu y
              </Typography>

              {topCustomers.slice(0, 3).map((customer) => (
                <Stack key={customer.customerKey} direction="row" justifyContent="space-between" alignItems="center" gap={2} py={1} borderBottom="1px solid" borderColor="divider">
                  <Stack direction="row" gap={1.5} alignItems="center">
                    <Avatar sx={{ bgcolor: '#dbeafe', color: '#1d4ed8' }}>
                      {customer.name?.charAt(0)?.toUpperCase() || 'K'}
                    </Avatar>
                    <Stack>
                      <Typography fontWeight={700}>{customer.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {customer.orders} don
                      </Typography>
                    </Stack>
                  </Stack>
                  <Typography fontWeight={700}>{formatCurrency(customer.spent)}</Typography>
                </Stack>
              ))}

              {inventoryAlerts.slice(0, 3).map((product) => (
                <Stack key={product._id} direction="row" justifyContent="space-between" alignItems="center" gap={2} py={1} borderBottom="1px solid" borderColor="divider">
                  <Stack direction="row" gap={1.5} alignItems="center">
                    <Avatar src={getImageUrl(product.thumbnail)} variant="rounded" sx={{ width: 44, height: 44 }} />
                    <Stack>
                      <Typography fontWeight={700}>{product.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {product.brand || 'Thuong hieu dang cap nhat'}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Chip
                    size="small"
                    color={product.stockQuantity <= 0 ? 'error' : 'warning'}
                    label={product.stockQuantity <= 0 ? 'Het hang' : `Con ${product.stockQuantity}`}
                  />
                </Stack>
              ))}

              {!topCustomers.length && !inventoryAlerts.length ? (
                <Typography color="text.secondary">Chua co du lieu noi bat trong ky nay.</Typography>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  )
}
