import { LoadingButton } from '@mui/lab'
import { Button, Paper, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from 'react-redux'
import { deleteAddressByIdAsync, selectAddressErrors, selectAddressStatus, updateAddressByIdAsync } from '../AddressSlice'

export const Address = ({id,type,street,postalCode,country,phoneNumber,state,city}) => {

    const theme=useTheme()
    const dispatch=useDispatch()
    const {register,handleSubmit,watch,reset,formState: { errors }} = useForm()
    const [edit,setEdit]=useState(false)
    const [open, setOpen] = useState(false);
    const status=useSelector(selectAddressStatus)
    const error=useSelector(selectAddressErrors)
    
    const is480=useMediaQuery(theme.breakpoints.down(480))

    const handleRemoveAddress=()=>{
        dispatch(deleteAddressByIdAsync(id))
    }

    const handleUpdateAddress=(data)=>{
        const update={...data,_id:id}
        setEdit(false)
        dispatch(updateAddressByIdAsync(update))
    }


  return (
    <Stack width={'100%'} p={is480?0:1}>
                                        
        
        <Stack color={'whitesmoke'} p={'.5rem'} borderRadius={'.2rem'} bgcolor={theme.palette.primary.main}>
            <Typography>{type?.toUpperCase()}</Typography>
        </Stack>

       
        <Stack p={2} position={'relative'} flexDirection={'column'} rowGap={1} component={'form'} noValidate onSubmit={handleSubmit(handleUpdateAddress)}>

            
            {
                edit?
                (   
                    // update address form
                    <Stack rowGap={2}>
                        
                        <Stack>
                            <Typography gutterBottom>Nợi Nhận</Typography>
                            <TextField {...register("type",{required:true,value:type})}/>
                        </Stack>


                        <Stack>
                            <Typography gutterBottom>Tên Đường</Typography>
                            <TextField {...register("street",{required:true,value:street})}/>
                        </Stack>

                        <Stack>
                            <Typography gutterBottom>Mã Bưu Chính</Typography>
                            <TextField type='number' {...register("postalCode",{required:true,value:postalCode})}/>
                        </Stack>

                        <Stack>
                            <Typography gutterBottom>Quốc Gia</Typography>
                            <TextField {...register("country",{required:true,value:country})}/>
                        </Stack>

                        <Stack>
                            <Typography  gutterBottom>Số Điện Thoại</Typography>
                            <TextField type='number' {...register("phoneNumber",{required:true,value:phoneNumber})}/>
                        </Stack>


                        <Stack>
                            <Typography gutterBottom>Thành Phố</Typography>
                            <TextField {...register("city",{required:true,value:city})}/>
                        </Stack>
                    </Stack>
                ):(
                <>
                <Typography>Tên Đường - {street}</Typography>
                <Typography>Mã Bưu Chính - {postalCode}</Typography>
                <Typography>Quốc Gia - {country}</Typography>
                <Typography>Số Điện Thoại - {phoneNumber}</Typography>
                <Typography>Thành Phố - {city}</Typography>
                </>
                )
            }

           
            <Stack position={is480?"static":edit?"static":'absolute'} bottom={4} right={4} mt={is480?2:4} flexDirection={'row'} alignSelf={'flex-end'} columnGap={1}>

                
                {
                    edit?(<LoadingButton loading={status==='pending'} size='small' type='submit' variant='contained'>Lưu</LoadingButton>
                    ):(<Button size='small' onClick={()=>setEdit(true)} variant='contained'>Chỉnh sửa</Button>)
                }

                
                {
                    edit?(
                        <Button size='small' onClick={()=>{setEdit(false);reset()}} variant='outlined' color='error'>Hủy</Button>
                    ):(
                        <LoadingButton loading={status==='pending'} size='small' onClick={handleRemoveAddress} variant='outlined' color='error' >Xóa</LoadingButton>
                    )
                }
            </Stack>
        </Stack>

    </Stack>
  )
}
