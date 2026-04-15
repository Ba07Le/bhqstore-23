import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Box, Backdrop, Stack, Typography, Zoom } from '@mui/material'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded' // Thêm icon thành công
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import SellRoundedIcon from '@mui/icons-material/SellRounded'
import { toast } from 'react-toastify'
import Lottie from 'lottie-react'

import {
  addProductAsync,
  resetProductAddStatus,
  selectProductAddStatus,
} from '../../products/ProductSlice'
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { productImageFieldNames } from '../adminConfig'
import { ProductEditorForm } from './ProductEditorForm'
import { loadingAnimation } from '../../../assets'

export const AddProduct = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)
  const productAddStatus = useSelector(selectProductAddStatus)

  useEffect(() => {
    if (productAddStatus === 'fulfilled') {
      // Thông báo toast vẫn giữ
      toast.success('Sản phẩm mới đã được thêm vào danh mục')
      
      // Giữ màn hình "Thành công" trong 2 giây để Admin kịp nhìn
      const timer = setTimeout(() => {
        navigate('/admin/dashboard')
      }, 2000)

      return () => clearTimeout(timer)
    } else if (productAddStatus === 'rejected') {
      toast.error('Không thể thêm sản phẩm, vui lòng thử lại sau')
    }
  }, [navigate, productAddStatus])

  useEffect(() => {
    return () => {
      dispatch(resetProductAddStatus())
    }
  }, [dispatch])

  const handleAddProduct = (data) => {
    const formData = new FormData()
    formData.append('title', data.title.trim())
    formData.append('description', data.description.trim())
    formData.append('price', data.price)
    formData.append('stockQuantity', data.stockQuantity)
    formData.append('brand', data.brand)
    formData.append('category', data.category)
    formData.append('thumbnail', data.thumbnail[0])

    productImageFieldNames.forEach((fieldName) => {
      if (data[fieldName] && data[fieldName][0]) {
        formData.append('images', data[fieldName][0])
      }
    })
    dispatch(addProductAsync(formData))
  }

  return (
    <Box sx={{ transform: 'scale(0.8)', transformOrigin: 'top left', width: '125%', position: 'relative' }}>
      
      {/* LOADING & SUCCESS OVERLAY */}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 999,
          flexDirection: 'column',
          bgcolor: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(6px)',
        }}
        open={productAddStatus === 'pending' || productAddStatus === 'fulfilled'}
      >
        <Stack alignItems="center" spacing={3}>
          {productAddStatus === 'pending' ? (
            // HIỂN THỊ KHI ĐANG LƯU
            <>
              <Box sx={{ width: 250 }}>
                <Lottie animationData={loadingAnimation} loop={true} />
              </Box>
              <Typography variant="h5" sx={{ color: '#1a1a1a', fontWeight: 700 }}>
                Đang lưu và đăng tải sản phẩm...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hệ thống đang xử lý hình ảnh và dữ liệu, vui lòng đợi.
              </Typography>
            </>
          ) : (
            // HIỂN THỊ KHI ĐÃ THÀNH CÔNG (fulfilled)
            <Zoom in={productAddStatus === 'fulfilled'}>
              <Stack alignItems="center" spacing={2}>
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 100, color: '#2e7d32' }} />
                <Typography variant="h4" sx={{ color: '#2e7d32', fontWeight: 800 }}>
                  HOÀN TẤT!
                </Typography>
                <Typography variant="h6" sx={{ color: '#1a1a1a', textAlign: 'center' }}>
                  Sản phẩm đã được đăng thành công.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Đang chuyển hướng về bảng điều khiển...
                </Typography>
              </Stack>
            </Zoom>
          )}
        </Stack>
      </Backdrop>

      <ProductEditorForm
        mode="create"
        introTitle="Tạo sản phẩm mới"
        introDescription="Điền đầy đủ nội dung, giá, tồn kho và hình ảnh để sản phẩm sẵn sàng đăng bán."
        chips={[
          { icon: <SellRoundedIcon />, label: 'Trung tâm danh mục' },
          { icon: <ImageRoundedIcon />, label: 'Yêu cầu hình ảnh' },
          { icon: <Inventory2RoundedIcon />, label: 'Sẵn sàng đăng tải' },
        ]}
        brands={brands}
        categories={categories}
        submitStatus={productAddStatus}
        submitLabel="Lưu và đăng sản phẩm"
        pendingLabel="Đang lưu..."
        onSubmit={handleAddProduct}
      />
    </Box>
  )
}