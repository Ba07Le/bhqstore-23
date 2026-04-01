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

      toast.success(result?.message || 'Da cap nhat ket qua thanh toan')
      navigate(`/order-success/${id}`)
    } catch (error) {
      toast.error(error?.message || 'Khong the xu ly thanh toan mo phong')
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
                Cong thanh toan mo phong
              </Typography>
              <Typography color="text.secondary">
                He thong dang chay che do test local vi chua co credential sandbox cho cong thanh
                toan that.
              </Typography>
            </Stack>

            {isSupported ? (
              <>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                  Ban co the mo phong ket qua thanh toan thanh cong hoac that bai de kiem tra toan
                  bo luong mua hang.
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
                      Don hang
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
                    Xac nhan thanh toan thanh cong
                  </Button>
                  <Button
                    fullWidth
                    size="large"
                    variant="outlined"
                    color="error"
                    disabled={isProcessing}
                    onClick={() => handleCompletePayment(false)}
                  >
                    Mo phong that bai
                  </Button>
                </Stack>
              </>
            ) : (
              <Alert severity="warning" sx={{ borderRadius: 3 }}>
                Khong xac dinh duoc gateway hoac ma don hang de mo phong thanh toan.
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <Button component={Link} to="/checkout" fullWidth variant="outlined">
                Quay lai checkout
              </Button>
              <Button component={Link} to="/products" fullWidth variant="text">
                Tiep tuc mua sam
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Stack>
      <Footer />
    </>
  )
}
