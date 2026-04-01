import { Box, FormHelperText, Stack, TextField, Typography, useMediaQuery, useTheme, Paper } from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab';
import { selectLoggedInUser, loginAsync, selectLoginStatus, selectLoginError, clearLoginError, resetLoginStatus } from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'

export const Login = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectLoginStatus)
  const error = useSelector(selectLoginError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const theme = useTheme()
  const is480 = useMediaQuery(theme.breakpoints.down(480))

  
  useEffect(() => {
    if (loggedInUser && loggedInUser?.isVerified) {
      navigate("/")
    }
    else if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp")
    }
  }, [loggedInUser])

  // show error
  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  // login success + cleanup
  useEffect(() => {
    if (status === 'fullfilled' && loggedInUser?.isVerified === true) {
      toast.success(`Đăng nhập thành công`)
      reset()
    }
    return () => {
      dispatch(clearLoginError())
      dispatch(resetLoginStatus())
    }
  }, [status])

  const handleLogin = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(loginAsync(cred))
  }

  return (
    <Stack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{ backgroundColor: "#f5f5f5" }}
    >

      
      <Paper elevation={3} sx={{ p: 4, width: is480 ? "95%" : "28rem", borderRadius: 3 }}>

        <Stack alignItems="center" mb={3}>
          <Typography variant='h4' fontWeight={600}>BHQ Store</Typography>
          <Typography color="GrayText" variant='body2'>Shop Technology</Typography>
        </Stack>

        <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit(handleLogin)}>

          <motion.div whileHover={{ y: -3 }}>
            <TextField
              fullWidth
              {...register("email", {
                required: "Bắt buộc",
                pattern: {
                  value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                  message: "Không tồn tại email"
                }
              })}
              placeholder='Email'
            />
            {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ y: -3 }}>
            <TextField
              type='password'
              fullWidth
              {...register("password", { required: "Bắt buộc" })}
              placeholder='Password'
            />
            {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
          </motion.div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton
              fullWidth
              sx={{ height: '2.8rem', mt: 1 }}
              loading={status === 'pending'}
              type='submit'
              variant='contained'
            >
              Đăng Nhập
            </LoadingButton>
          </motion.div>

          <Stack flexDirection="row" justifyContent="space-between" alignItems="center">

            <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.05 }}>
              <motion.div>
                <Typography component={Link} to="/forgot-password" sx={{ textDecoration: "none", color: "text.primary" }}>
                  Quên mật khẩu?
                </Typography>
              </motion.div>

              <motion.div>
                <Typography component={Link} to="/signup" sx={{ textDecoration: "none", color: "text.primary" }}>
                  Chưa có tài khoản? <span style={{ color: theme.palette.primary.dark }}>Đăng ký</span>
                </Typography>
              </motion.div>
            </MotionConfig>

          </Stack>

        </Stack>
      </Paper>
    </Stack>
  )
}
