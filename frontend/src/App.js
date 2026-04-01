import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Navigate,
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom'
import { CircularProgress, Paper, Stack, Typography } from '@mui/material'

import { selectIsAuthChecked, selectLoggedInUser } from './features/auth/AuthSlice'
import { Logout } from './features/auth/components/Logout'
import { Protected } from './features/auth/components/Protected'
import { fetchAllBrandsAsync } from './features/brands/BrandSlice'
import { fetchGuestCart } from './features/cart/CartSlice'
import { fetchAllCategoriesAsync } from './features/categories/CategoriesSlice'
import { useAuthCheck } from './hooks/useAuth/useAuthCheck'
import { useFetchLoggedInUserDetails } from './hooks/useAuth/useFetchLoggedInUserDetails'
import { RootLayout } from './layout/RootLayout'
import {
  AddProductPage,
  AdminOrdersPage,
  CartPage,
  CheckoutPage,
  ForgotPasswordPage,
  HomePage,
  LoginPage,
  MockPaymentPage,
  OrderSuccessPage,
  OtpVerificationPage,
  ProductDetailsPage,
  ProductUpdatePage,
  ResetPasswordPage,
  SignupPage,
  UserOrdersPage,
  UserProfilePage,
  WishlistPage,
} from './pages'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { NotFoundPage } from './pages/NotFoundPage'

import './assets/productDescription.css'

function App() {
  const dispatch = useDispatch()
  const isAuthChecked = useSelector(selectIsAuthChecked)
  const loggedInUser = useSelector(selectLoggedInUser)

  useAuthCheck()
  useFetchLoggedInUserDetails(loggedInUser)

  useEffect(() => {
    if (!loggedInUser) {
      dispatch(fetchGuestCart())
    }
  }, [dispatch, loggedInUser])

  useEffect(() => {
    dispatch(fetchAllCategoriesAsync())
    dispatch(fetchAllBrandsAsync())
  }, [dispatch])

  const routes = createBrowserRouter(
    createRoutesFromElements(
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<HomePage />} />
        <Route path="/product-details/:id" element={<ProductDetailsPage />} />

        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/mock-payment/:id" element={<MockPaymentPage />} />
        <Route path="/order-success/:id" element={<OrderSuccessPage />} />

        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/reset-password/:userId/:passwordResetToken"
          element={<ResetPasswordPage />}
        />

        <Route
          path="/logout"
          element={
            <Protected>
              <Logout />
            </Protected>
          }
        />

        {loggedInUser?.isAdmin ? (
          <>
            <Route
              path="/admin/dashboard"
              element={
                <Protected>
                  <AdminDashboardPage />
                </Protected>
              }
            />
            <Route
              path="/admin/product-update/:id"
              element={
                <Protected>
                  <ProductUpdatePage />
                </Protected>
              }
            />
            <Route
              path="/admin/add-product"
              element={
                <Protected>
                  <AddProductPage />
                </Protected>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <Protected>
                  <AdminOrdersPage />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/admin/dashboard" />} />
          </>
        ) : (
          <>
            <Route
              path="/profile"
              element={
                <Protected>
                  <UserProfilePage />
                </Protected>
              }
            />
            <Route
              path="/orders"
              element={
                <Protected>
                  <UserOrdersPage />
                </Protected>
              }
            />
          </>
        )}

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    )
  )

  if (!isAuthChecked) {
    return (
      <Stack
        minHeight="100vh"
        alignItems="center"
        justifyContent="center"
        px={2}
        sx={{
          background:
            'linear-gradient(180deg, rgba(244,247,251,1) 0%, rgba(255,255,255,1) 100%)',
        }}
      >
        <Paper
          elevation={2}
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 4,
            px: 4,
            py: 5,
            textAlign: 'center',
          }}
        >
          <Stack alignItems="center" rowGap={2}>
            <CircularProgress />
            <Typography variant="h6" fontWeight={700}>
              Dang tai giao dien
            </Typography>
            <Typography color="text.secondary">
              He thong dang kiem tra phien dang nhap va tai du lieu ban dau.
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    )
  }

  return <RouterProvider router={routes} />
}

export default App
