import { FormHelperText, Stack, TextField, Typography, Paper, useTheme, useMediaQuery } from '@mui/material'
import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import { LoadingButton } from '@mui/lab';
import { selectLoggedInUser, signupAsync, selectSignupStatus, selectSignupError, clearSignupError, resetSignupStatus } from '../AuthSlice'
import { toast } from 'react-toastify'
import { MotionConfig, motion } from 'framer-motion'

export const Signup = () => {
  const dispatch = useDispatch()
  const status = useSelector(selectSignupStatus)
  const error = useSelector(selectSignupError)
  const loggedInUser = useSelector(selectLoggedInUser)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const navigate = useNavigate()
  const theme = useTheme()
  const is480 = useMediaQuery(theme.breakpoints.down(480))


  useEffect(() => {
    if (loggedInUser && !loggedInUser?.isVerified) {
      navigate("/verify-otp")
    }
    else if (loggedInUser) {
      navigate("/")
    }
  }, [loggedInUser])

 
  useEffect(() => {
    if (error) {
      toast.error(error.message)
    }
  }, [error])

  useEffect(() => {
    if (status === 'fullfilled') {
      toast.success("Hãy xác thực email để được trải nghiệm dịch vụ")
      reset()
    }
    return () => {
      dispatch(clearSignupError())
      dispatch(resetSignupStatus())
    }
  }, [status])

  const handleSignup = (data) => {
    const cred = { ...data }
    delete cred.confirmPassword
    dispatch(signupAsync(cred))
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

        <Stack spacing={2} component="form" noValidate onSubmit={handleSubmit(handleSignup)}>

          <MotionConfig whileHover={{ y: -3 }}>

            <motion.div>
              <TextField fullWidth {...register("name", { required: "Bắt buộc" })} placeholder='Username' />
              {errors.name && <FormHelperText error>{errors.name.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                fullWidth
                {...register("email", {
                  required: "Bắt buộc",
                  pattern: {
                    value: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
                    message: "Nhập sai email"
                  }
                })}
                placeholder='Email'
              />
              {errors.email && <FormHelperText error>{errors.email.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                type='password'
                fullWidth
                {...register("password", {
                  required: "Bắt buộc",
                  pattern: {
                    value: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,
                    message: `Ít nhất 8 ký tự, có chữ hoa, chữ thường và số`
                  }
                })}
                placeholder='Password'
              />
              {errors.password && <FormHelperText error>{errors.password.message}</FormHelperText>}
            </motion.div>

            <motion.div>
              <TextField
                type='password'
                fullWidth
                {...register("confirmPassword", {
                  required: "Bắt buộc",
                  validate: (value, formValues) => value === formValues.password || "Passwords không đúng"
                })}
                placeholder='Confirm Password'
              />
              {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword.message}</FormHelperText>}
            </motion.div>

          </MotionConfig>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 1 }}>
            <LoadingButton fullWidth sx={{ height: '2.8rem', mt: 1 }} loading={status === 'pending'} type='submit' variant='contained'>
              Đăng Ký
            </LoadingButton>
          </motion.div>

          <Stack flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexWrap={'wrap-reverse'}>
            <MotionConfig whileHover={{ x: 2 }} whileTap={{ scale: 1.05 }}>
              <motion.div>
                <Typography component={Link} to={'/forgot-password'} sx={{ textDecoration: "none", color: "text.primary" }}>
                  Quên mật khẩu?
                </Typography>
              </motion.div>

              <motion.div>
                <Typography component={Link} to={'/login'} sx={{ textDecoration: "none", color: "text.primary" }}>
                  Đã có tài khoản? <span style={{ color: theme.palette.primary.dark }}>Đăng nhập</span>
                </Typography>
              </motion.div>
            </MotionConfig>
          </Stack>

        </Stack>
      </Paper>
    </Stack>
  )
}
