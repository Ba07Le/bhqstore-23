import React, { useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'

import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { adminNavigationItems } from '../adminConfig'
import { formatAdminHeaderDate } from '../adminHelpers'
import { selectLoggedInUser } from '../../auth/AuthSlice'

// ✅ Giảm chiều rộng sidebar (từ 284 -> 240)
const sidebarWidth = 240 

export const AdminShell = ({
  children,
}) => {
  const location = useLocation()
  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down('lg'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const renderSidebar = () => (
    <Stack
      sx={{
        height: '100vh',
        overflowY: 'auto',
        color: '#fff',
        background: 'linear-gradient(180deg, rgba(14,23,42,1) 0%, rgba(17,24,39,1) 55%, rgba(30,41,59,1) 100%)',
        scrollbarWidth: 'none', // Ẩn scrollbar để giao diện sạch hơn
        '&::-webkit-scrollbar': { display: 'none' }
      }}
    >
      {/* Header Logo Section - Thu nhỏ padding và gap */}
      <Stack px={2.5} py={2.5} rowGap={2}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 38, // ✅ Giảm từ 48
              height: 38,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(251,146,60,1) 0%, rgba(249,115,22,1) 100%)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <StorefrontRoundedIcon sx={{ fontSize: '1.2rem' }} />
          </Box>

          <Stack>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              BHQ Seller Center
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
              Vận hành như một sàn thương mại điện tử
            </Typography>
          </Stack>
        </Stack>

        {/* Info Card - Thu nhỏ font và padding */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 3,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Stack rowGap={0.5}>
            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Không gian làm việc
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, lineHeight: 1.4 }}>
              Theo dõi doanh thu & tiến độ đơn hàng
            </Typography>
            <Chip
              icon={<InsightsRoundedIcon sx={{ color: '#fff !important', fontSize: '0.9rem' }} />}
              label="Live Mode"
              size="small"
              sx={{
                alignSelf: 'flex-start',
                mt: 0.5,
                height: 20,
                fontSize: '0.65rem',
                bgcolor: 'rgba(255,255,255,0.1)',
                color: '#fff',
              }}
            />
          </Stack>
        </Paper>
      </Stack>

      {/* Navigation - Thu nhỏ margin và padding item */}
      <Box px={1.5} flex={1}>
        <Typography px={1.5} pb={1} variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, textTransform: 'uppercase' }}>
          Điều hướng
        </Typography>

        <List disablePadding sx={{ display: 'grid', gap: 0.4 }}>
          {adminNavigationItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 2,
                  px: 1.2,
                  py: 1, // ✅ Thu hẹp chiều cao item
                  bgcolor: isActive ? 'rgba(251,146,60,0.12)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(251,146,60,0.2)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36, // ✅ Giảm từ 42
                    color: isActive ? '#fb923c' : 'rgba(255,255,255,0.6)',
                  }}
                >
                  {React.cloneElement(item.icon, { sx: { fontSize: '1.2rem' } })}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem', // ✅ Giảm size chữ
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.8)',
                  }}
                  secondary={item.helper}
                  secondaryTypographyProps={{
                    fontSize: '0.7rem',
                    color: 'rgba(255,255,255,0.5)',
                    sx: { display: isActive ? 'block' : 'none' } // Chỉ hiện helper khi active để tiết kiệm diện tích
                  }}
                />
                <ChevronRightRoundedIcon
                  sx={{
                    fontSize: '1rem',
                    color: isActive ? '#fb923c' : 'rgba(255,255,255,0.2)',
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* Footer Actions - Thu nhỏ footer */}
      <Box px={2} py={2}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />
        <Stack rowGap={0.5}>
          <Button
            component={Link}
            to="/"
            variant="text"
            startIcon={<StorefrontRoundedIcon sx={{ fontSize: '1.1rem' }} />}
            sx={{
              justifyContent: 'flex-start',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem',
              textTransform: 'none',
              py: 0.8,
              '&:hover': { color: '#fff' }
            }}
          >
            Giao diện người dùng
          </Button>

          <Button
            component={Link}
            to="/logout"
            variant="text"
            startIcon={<LogoutRoundedIcon sx={{ fontSize: '1.1rem' }} />}
            sx={{
              justifyContent: 'flex-start',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '0.75rem',
              textTransform: 'none',
              py: 0.8,
              '&:hover': { color: '#f87171' }
            }}
          >
            Đăng xuất
          </Button>
        </Stack>
      </Box>
    </Stack>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f8fafc' }}>
      {isMdDown ? (
        <>
          <IconButton 
            onClick={() => setDrawerOpen(true)}
            sx={{ position: 'fixed', top: 10, left: 10, zIndex: 1100, bgcolor: '#fff', boxShadow: 1 }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            PaperProps={{ sx: { width: sidebarWidth, border: 0 } }}
          >
            {renderSidebar()}
          </Drawer>
        </>
      ) : (
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
          }}
        >
          {renderSidebar()}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack sx={{ p: { xs: 2, md: 3 }, maxWidth: 1600, mx: 'auto' }}>
          {children}
        </Stack>
      </Box>
    </Box>
  )
}