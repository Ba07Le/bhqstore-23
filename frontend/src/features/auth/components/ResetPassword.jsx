import { FormHelperText, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import {clearResetPasswordError, clearResetPasswordSuccessMessage, resetPasswordAsync, resetResetPasswordStatus, selectResetPasswordError, selectResetPasswordStatus, selectResetPasswordSuccessMessage } from '../AuthSlice'
import { LoadingButton } from '@mui/lab'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {MotionConfig,motion} from 'framer-motion'

export const ResetPassword = () => {
    const {register,handleSubmit,reset,formState: { errors }} = useForm()
    const dispatch=useDispatch()
    const status=useSelector(selectResetPasswordStatus)
    const error=useSelector(selectResetPasswordError)
    const successMessage=useSelector(selectResetPasswordSuccessMessage)
    const {userId,passwordResetToken}=useParams()
    const navigate=useNavigate()
    const theme=useTheme()
    const is500=useMediaQuery(theme.breakpoints.down(500))

    useEffect(()=>{
        if(error){
            toast.error(error.message)
        }
        return ()=>{
            dispatch(clearResetPasswordError())
        }
    },[error])

    useEffect(()=>{
        if(status==='fullfilled'){
            toast.success(successMessage?.message)
            navigate("/login")
        }
        return ()=>{
            dispatch(clearResetPasswordSuccessMessage())
        }
    },[status])

    useEffect(()=>{
        return ()=>{
            dispatch(resetResetPasswordStatus())
        }
    },[])

    const handleResetPassword=async(data)=>{
        const cred={...data,userId:userId,token:passwordResetToken}
        delete cred.confirmPassword
        dispatch(resetPasswordAsync(cred))
        reset()
    }

  return (
    <Stack width={'100vw'} height={'100vh'} justifyContent={'center'} alignItems={'center'}>

        <Stack>

            <Stack component={Paper} elevation={2}>
                <Stack component={'form'} width={is500?"95vw":'30rem'} p={'1rem'} rowGap={'1rem'} noValidate onSubmit={handleSubmit(handleResetPassword)}>

                        <Stack rowGap={'.3rem'}>
                            <Typography variant='h4' fontWeight={600}>Đặt lại mật khẩu</Typography>
                            <Typography color={'GrayText'}>Nhập lại mật khẩu mới</Typography>
                        </Stack>
                        
                        <Stack rowGap={'.5rem'}>
                            <MotionConfig whileHover={{y:-2}}>

                                <motion.div>
                                    <TextField type='password' fullWidth sx={{mt:1}} {...register("password",{required:"Hãy nhập mật khẩu",pattern:{value:/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,message:`Ít nhất 8 ký tự, phải chứa ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường và 1 chữ số. Có thể chứa các ký tự đặc biệt.`}})} placeholder='New Password'/>
                                    {errors.password && <FormHelperText sx={{mt:1}} error>{errors.password.message}</FormHelperText>}
                                </motion.div>
                                
                                <motion.div>
                                    <TextField type='password' fullWidth sx={{mt:1}} {...register("confirmPassword",{required:"Hãy nhập lại mật khẩu",validate:(value,formValues)=>value===formValues.password || "Mật khẩu không hợp lệ"})} placeholder='Xác nhận lại mật khẩu'/>
                                    {errors.confirmPassword && <FormHelperText sx={{mt:1}} error>{errors.confirmPassword.message}</FormHelperText>}
                                </motion.div>
                                
                            </MotionConfig>
                        </Stack>

                        <motion.div whileHover={{scale:1.020}} whileTap={{scale:1}}>
                            <LoadingButton sx={{height:"2.5rem"}} fullWidth loading={status==='pending'} type='submit' variant='contained'>Reset mật khẩu</LoadingButton>
                        </motion.div>
                </Stack>
            </Stack>

        </Stack>
    </Stack>
  )
}
