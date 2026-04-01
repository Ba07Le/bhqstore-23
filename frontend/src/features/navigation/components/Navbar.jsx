import * as React from 'react'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { selectLoggedInUser } from '../../auth/AuthSlice'
import { selectCartItems } from '../../cart/CartSlice'
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice'
import { selectUserInfo } from '../../user/UserSlice'
import { selectWishlistItems } from '../../wishlist/WishlistSlice'

export const Navbar = ({ isProductList = false }) => {
  const [anchorElUser, setAnchorElUser] = React.useState(null)
  const [search, setSearch] = React.useState('')

  const userInfo = useSelector(selectUserInfo)
  const cartItems = useSelector(selectCartItems)
  const wishlistItems = useSelector(selectWishlistItems)
  const loggedInUser = useSelector(selectLoggedInUser)
  const isProductFilterOpen = useSelector(selectProductIsFilterOpen)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  React.useEffect(() => {
    const keyword = new URLSearchParams(location.search).get('search') || ''
    setSearch(keyword)
  }, [location.search])

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseUserMenu = () => setAnchorElUser(null)

  const menuItems = loggedInUser?.isAdmin
    ? [
        { label: 'Dashboard', to: '/admin/dashboard' },
        { label: 'Cua hang', to: '/' },
        { label: 'Dang xuat', to: '/logout', dividerBefore: true },
      ]
    : [
        { label: 'Trang chu', to: '/' },
        { label: 'Tai khoan', to: '/profile' },
        { label: 'Don cua toi', to: '/orders' },
        { label: 'Dang xuat', to: '/logout', dividerBefore: true },
      ]

  const handleSearchNavigate = () => {
    const trimmedSearch = search.trim()

    if (!trimmedSearch) {
      navigate('/products')
      return
    }

    navigate(`/products?search=${encodeURIComponent(trimmedSearch)}`)
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #eee',
        height: 64,
        justifyContent: 'center',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} flex={1}>
          {isProductList && (
            <IconButton
              onClick={() => dispatch(toggleFilters())}
              sx={{ bgcolor: isProductFilterOpen ? 'grey.200' : 'transparent' }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            component={Link}
            to={loggedInUser?.isAdmin ? '/admin/dashboard' : '/'}
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              textDecoration: 'none',
              color: 'text.primary',
              fontSize: '1.1rem',
            }}
          >
            BHQ<span style={{ color: '#1976d2' }}>Store</span>
          </Typography>

          {!isMobile && (
            <TextField
              size="small"
              placeholder="Tim san pham..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearchNavigate()
                }
              }}
              sx={{ width: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          {!isMobile && (
            <IconButton onClick={handleSearchNavigate}>
              <SearchIcon />
            </IconButton>
          )}

          {!loggedInUser?.isAdmin && (
            <>
              <Badge badgeContent={wishlistItems?.length} color="error">
                <IconButton component={Link} to="/wishlist">
                  <FavoriteBorderIcon />
                </IconButton>
              </Badge>

              <Badge badgeContent={cartItems?.length} color="error">
                <IconButton onClick={() => navigate('/cart')}>
                  <ShoppingCartOutlinedIcon />
                </IconButton>
              </Badge>
            </>
          )}

          {loggedInUser && userInfo ? (
            <Tooltip title="Tai khoan">
              <IconButton onClick={handleOpenUserMenu}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#1976d2' }}>
                  {userInfo?.name?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button
                component={Link}
                to="/login"
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Dang nhap
              </Button>
              {!isMobile && (
                <Button
                  component={Link}
                  to="/signup"
                  variant="contained"
                  disableElevation
                  sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                  Dang ky
                </Button>
              )}
            </Stack>
          )}
        </Stack>
      </Toolbar>

      <Menu
        anchorEl={anchorElUser}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
        MenuListProps={{
          dense: true,
          sx: { py: 0.5 },
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 196,
            borderRadius: 3,
            p: 0.5,
          },
        }}
      >
        <Box px={1.5} py={1}>
          <Typography fontWeight={700}>{userInfo?.name || 'Tai khoan'}</Typography>
        </Box>

        <Divider />

        {menuItems.map((item) => (
          <React.Fragment key={item.label}>
            {item.dividerBefore ? <Divider sx={{ my: 0.5 }} /> : null}
            <MenuItem
              component={Link}
              to={item.to}
              onClick={handleCloseUserMenu}
              sx={{ borderRadius: 2, minHeight: 38, px: 1.5 }}
            >
              {item.label}
            </MenuItem>
          </React.Fragment>
        ))}
      </Menu>
    </AppBar>
  )
}
