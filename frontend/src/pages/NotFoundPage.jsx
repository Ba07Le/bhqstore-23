import { Button, Paper, Stack, Typography } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom'
import { notFoundPageAnimation } from '../assets'
import Lottie from 'lottie-react'


export const NotFoundPage = () => {
  return (
    <Stack justifyContent={'center'} alignItems={'center'} height={'100vh'}>

        <Stack rowGap={1} justifyContent={'center'} alignItems={'center'}>
            
            <Stack width={'25rem'}>
                <Lottie animationData={notFoundPageAnimation}/>
            </Stack>
            
            <Stack justifyContent={'center'} alignItems={'center'}>
              <Typography variant='h4' fontWeight={500}>404 Not Found</Typography>
              <Typography variant='h6' fontWeight={'300'}>Xin lỗi, chúng tôi không tải được trang bạn cần</Typography>
            </Stack>

            <Button sx={{mt:3}} size='large' component={Link} to={'/'} variant='contained'>Quay lại trang chủ</Button>
        </Stack>

    </Stack>
  )
}
