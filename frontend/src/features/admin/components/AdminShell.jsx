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
import { formatAdminHeaderDate, getInitials } from '../adminHelpers'
import { selectLoggedInUser } from '../../auth/AuthSlice'

const sidebarWidth = 284

export const AdminShell = ({
  title,
  description,
  actions,
  stats = [],
  children,
}) => {
  const location = useLocation()
  const theme = useTheme()
  const isMdDown = useMediaQuery(theme.breakpoints.down('lg'))
  const loggedInUser = useSelector(selectLoggedInUser)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const currentDate = useMemo(() => formatAdminHeaderDate(), [])
  const displayName =
    loggedInUser?.name || loggedInUser?.email?.split('@')?.[0] || 'Admin'
  const storeLabel = loggedInUser?.email || 'admin@bhq.local'

  const renderSidebar = () => (
    <Stack
      sx={{
        height: '100%',
        color: '#fff',
        background:
          'linear-gradient(180deg, rgba(14,23,42,1) 0%, rgba(17,24,39,1) 55%, rgba(30,41,59,1) 100%)',
      }}
    >
      <Stack px={3} py={3} rowGap={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              background:
                'linear-gradient(135deg, rgba(251,146,60,1) 0%, rgba(249,115,22,1) 100%)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <StorefrontRoundedIcon />
          </Box>

          <Stack>
            <Typography variant="h6" fontWeight={800}>
              BHQ Seller Center
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Van hanh nhu mot san thuong mai
            </Typography>
          </Stack>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 4,
            color: '#fff',
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Stack rowGap={1}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)' }}>
              Workspace hom nay
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              Theo doi doanh thu, ton kho va tien do xu ly don
            </Typography>
            <Chip
              icon={<InsightsRoundedIcon sx={{ color: '#fff !important' }} />}
              label="Live operation mode"
              size="small"
              sx={{
                alignSelf: 'flex-start',
                mt: 0.5,
                bgcolor: 'rgba(255,255,255,0.12)',
                color: '#fff',
              }}
            />
          </Stack>
        </Paper>
      </Stack>

      <Box px={2}>
        <Typography px={1.5} pb={1} variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Dieu huong
        </Typography>

        <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
          {adminNavigationItems.map((item) => {
            const isActive = location.pathname === item.path

            return (
              <ListItemButton
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                sx={{
                  borderRadius: 3,
                  px: 1.5,
                  py: 1.25,
                  bgcolor: isActive ? 'rgba(251,146,60,0.16)' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(251,146,60,0.28)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 42,
                    color: isActive ? '#fb923c' : 'rgba(255,255,255,0.74)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={item.helper}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    color: '#fff',
                  }}
                  secondaryTypographyProps={{
                    color: 'rgba(255,255,255,0.6)',
                  }}
                />
                <ChevronRightRoundedIcon
                  sx={{
                    color: isActive ? '#fb923c' : 'rgba(255,255,255,0.28)',
                  }}
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      <Box mt="auto" px={3} py={3}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 2.5 }} />

        <Stack rowGap={1.2}>
          <Button
            component={Link}
            to="/"
            variant="outlined"
            startIcon={<StorefrontRoundedIcon />}
            sx={{
              justifyContent: 'flex-start',
              color: '#fff',
              borderColor: 'rgba(255,255,255,0.16)',
            }}
          >
            Ve storefront
          </Button>
          <Button
            component={Link}
            to="/logout"
            variant="text"
            startIcon={<LogoutRoundedIcon />}
            sx={{
              justifyContent: 'flex-start',
              color: 'rgba(255,255,255,0.84)',
            }}
          >
            Dang xuat
          </Button>
        </Stack>
      </Box>
    </Stack>
  )

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: '#f3f5f8' }}>
      {isMdDown ? (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: sidebarWidth, border: 0 } }}
        >
          {renderSidebar()}
        </Drawer>
      ) : (
        <Box
          sx={{
            width: sidebarWidth,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            borderRight: '1px solid rgba(15,23,42,0.08)',
          }}
        >
          {renderSidebar()}
        </Box>
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 2.5 },
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: '#fff',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', md: 'center' }}
              gap={2}
            >
              <Stack direction="row" alignItems="center" gap={1.5}>
                {isMdDown ? (
                  <IconButton onClick={() => setDrawerOpen(true)}>
                    <MenuRoundedIcon />
                  </IconButton>
                ) : null}

                <Stack>
                  <Typography variant="body2" color="text.secondary">
                    Admin workspace
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {title}
                  </Typography>
                  <Typography color="text.secondary">{currentDate}</Typography>
                </Stack>
              </Stack>

              <Stack direction="row" gap={1.5} alignItems="center" flexWrap="wrap">
                {actions}

                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 999,
                    bgcolor: '#f8fafc',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" gap={1.2} alignItems="center">
                    <Avatar sx={{ bgcolor: '#e2e8f0', color: '#0f172a' }}>
                      {getInitials(displayName)}
                    </Avatar>
                    <Stack>
                      <Typography fontWeight={700}>{displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {storeLabel}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 5,
              border: '1px solid',
              borderColor: 'divider',
              color: '#fff',
              background:
                'linear-gradient(135deg, rgba(251,146,60,1) 0%, rgba(249,115,22,1) 42%, rgba(194,65,12,1) 100%)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                right: -80,
                top: -60,
                width: 260,
                height: 260,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.08)',
              }}
            />

            <Stack direction={{ xs: 'column', xl: 'row' }} gap={2} justifyContent="space-between">
              <Stack rowGap={1.25} maxWidth={700} zIndex={1}>
                <Chip
                  label="Seller operation"
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    color: '#fff',
                    bgcolor: 'rgba(255,255,255,0.18)',
                  }}
                />
                <Typography variant="h4" fontWeight={900}>
                  {title}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.86)', maxWidth: 760 }}>
                  {description}
                </Typography>
              </Stack>

              {stats.length ? (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={1.5}
                  flexWrap="wrap"
                  zIndex={1}
                >
                  {stats.map((item) => (
                    <Paper
                      key={item.label}
                      elevation={0}
                      sx={{
                        minWidth: 150,
                        p: 1.5,
                        borderRadius: 4,
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.14)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {item.value}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Paper>

          <Box>{children}</Box>
        </Stack>
      </Box>
    </Box>
  )
}
