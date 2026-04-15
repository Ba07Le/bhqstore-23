import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'

import { Footer } from '../features/footer/Footer'
import {
  completeMockPaymentAsync,
  selectPaymentVerificationStatus,
} from '../features/order/OrderSlice'

const paymentMetaMap = {
  MOMO: {
    label: 'MoMo',
    color: '#d82d8b',
  },
  VNPAY: {
    label: 'VNPAY',
    color: '#005baa',
  },
}

export const MockPaymentPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const paymentVerificationStatus = useSelector(selectPaymentVerificationStatus)

  const gateway = useMemo(
    () => String(searchParams.get('gateway') || '').toUpperCase(),
    [searchParams]
  )

  const gatewayMeta = paymentMetaMap[gateway]
  const isProcessing = paymentVerificationStatus === 'pending'
  const isSupported = Boolean(id && gatewayMeta)

  const handleCompletePayment = async (success) => {
    if (!id || !gateway) return

    try {
      const result = await dispatch(
        completeMockPaymentAsync({
          orderId: id,
          gateway,
          success,
        })
      ).unwrap()

      toast.success(result?.message || 'Đã cập nhật kết quả thanh toán')
      navigate(`/order-success/${id}`)
    } catch (error) {
      toast.error(error?.message || 'Không thể xử lí thanh toán mô phỏng')
    }
  }

  return (
    <>
      <Stack minHeight="100vh" justifyContent="center" alignItems="center" px={2} py={6}>
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 620,
            borderRadius: 5,
            p: { xs: 3, md: 5 },
          }}
        >
          <Stack rowGap={3}>
            <Stack rowGap={1.5}>
              <Typography variant="h4" fontWeight={800}>
                Cổng thanh toán mô phỏng
              </Typography>
              <Typography color="text.secondary">
                Hệ thống đang chạy chế độ test local vì chưa có credential sandbox cho cổng thanh toán thật.
              </Typography>
            </Stack>

            {isSupported ? (
              <>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Bạn có thể mô phỏng kết quả thanh toán thành công hoặc thất bại để kiểm tra toàn bộ luồng mua hàng.
                </Alert>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  gap={2}
                  p={2.5}
                  sx={{
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)',
                  }}
                >
                  <Stack rowGap={0.75}>
                    <Typography variant="body2" color="text.secondary">
                      Đơn hàng
                    </Typography>
                    <Typography fontWeight={800}>#{id.slice(-8).toUpperCase()}</Typography>
                  </Stack>

                  <Chip
                    label={`${gatewayMeta.label} Mock`}
                    sx={{
                      fontWeight: 700,
                      color: '#fff',
                      bgcolor: gatewayMeta.color,
                    }}
                  />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={isProcessing}
                    onClick={() => handleCompletePayment(true)}
                  >
                    Xác nhận thanh toán thành công
                  </Button>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="error"
                    disabled={isProcessing}
                    onClick={() => handleCompletePayment(false)}
                  >
                    Mô phỏng thất bại
                  </Button>
                </Stack>
              </>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                Không xác định được gateway hoặc mã đơn hàng để mô phỏng thanh toán.
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button component={Link} to="/checkout" fullWidth variant="outlined">
                Quay lại checkout
              </Button>
              <Button component={Link} to="/products" fullWidth variant="text">
                Tiếp tục mua sắm
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
      <Footer />
    </>
  )
}
