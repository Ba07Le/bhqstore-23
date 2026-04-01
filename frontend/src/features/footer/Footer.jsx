import { Box, Divider, Stack, Typography, useMediaQuery, useTheme } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'
import { vaalogo } from '../../assets'

const footerLinkStyle = {
  textDecoration: 'none',
  color: 'inherit',
  opacity: 0.82,
}

export const Footer = () => {
  const theme = useTheme()
  const is900 = useMediaQuery(theme.breakpoints.down(900))

  return (
    <Stack
      sx={{
        background:
          'linear-gradient(180deg, rgba(18,21,27,1) 0%, rgba(11,13,17,1) 100%)',
        color: '#f6f4ef',
        pt: 5,
        px: is900 ? 2 : 5,
        pb: 2,
        rowGap: 4,
      }}
    >
      <Stack
        direction={is900 ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={is900 ? 'flex-start' : 'stretch'}
        gap={4}
      >
        <Stack rowGap={1.5} maxWidth={360}>
          <Typography variant="h5" fontWeight={800}>
            BHQ Store
          </Typography>
          <Typography color="rgba(255,255,255,0.72)">
            Cửa hàng phụ kiện gaming được xây dựng theo hướng hiện đại, rõ ràng và dễ mua sắm.
          </Typography>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              component="img"
              src={vaalogo}
              alt="VAA Logo"
              sx={{ width: 120, height: 50, objectFit: 'contain', filter: 'brightness(1.1)' }}
            />
            <Typography variant="body2" color="rgba(255,255,255,0.64)">
              Đồ án được hoàn thiện theo hướng một storefront thực tế.
            </Typography>
          </Stack>
        </Stack>

        <Stack rowGap={1.2}>
          <Typography fontWeight={700}>Điều hướng nhanh</Typography>
          <Typography component={Link} to="/" sx={footerLinkStyle}>
            Trang chủ
          </Typography>
          <Typography component={Link} to="/products" sx={footerLinkStyle}>
            Sản phẩm
          </Typography>
          <Typography component={Link} to="/cart" sx={footerLinkStyle}>
            Giỏ hàng
          </Typography>
          <Typography component={Link} to="/login" sx={footerLinkStyle}>
            Đăng nhập
          </Typography>
        </Stack>

        <Stack rowGap={1.2}>
          <Typography fontWeight={700}>Cam kết dịch vụ</Typography>
          <Typography color="rgba(255,255,255,0.72)">Giao hàng toàn quốc</Typography>
          <Typography color="rgba(255,255,255,0.72)">Theo dõi đơn hàng rõ ràng</Typography>
          <Typography color="rgba(255,255,255,0.72)">Đổi trả trong 30 ngày</Typography>
          <Typography color="rgba(255,255,255,0.72)">Hỗ trợ tư vấn ngay trên website</Typography>
        </Stack>

        <Stack rowGap={1.2}>
          <Typography fontWeight={700}>Nhóm phát triển</Typography>
          <Typography color="rgba(255,255,255,0.72)">Lê Đức Bảo</Typography>
          <Typography color="rgba(255,255,255,0.72)">Lê Hồng Quân</Typography>
          <Typography color="rgba(255,255,255,0.72)">Nguyễn Quốc Huy</Typography>
          <Typography color="rgba(255,255,255,0.56)">Hỗ trợ chuyên môn: Thầy Lê Mạnh Hùng</Typography>
        </Stack>
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

      <Stack
        direction={is900 ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={is900 ? 'flex-start' : 'center'}
        gap={1}
      >
        <Typography color="rgba(255,255,255,0.56)">
          © BHQ Store {new Date().getFullYear()}. All rights reserved.
        </Typography>
        <Typography color="rgba(255,255,255,0.56)">
          Built for a cleaner, more commercial-ready shopping experience.
        </Typography>
      </Stack>
    </Stack>
  )
}
