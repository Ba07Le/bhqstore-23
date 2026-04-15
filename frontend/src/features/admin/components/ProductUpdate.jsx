import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Box } from '@mui/material'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded'
import { toast } from 'react-toastify'

import {
  clearSelectedProduct,
  fetchProductByIdAsync,
  resetProductUpdateStatus,
  selectProductUpdateStatus,
  selectSelectedProduct,
  updateProductByIdAsync,
} from '../../products/ProductSlice'
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { productImageFieldNames } from '../adminConfig'
import { AdminSurface } from './AdminSurface'
import { ProductEditorForm } from './ProductEditorForm'

export const ProductUpdate = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const selectedProduct = useSelector(selectSelectedProduct)
  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)
  const productUpdateStatus = useSelector(selectProductUpdateStatus)

  useEffect(() => {
    if (id) {
      dispatch(fetchProductByIdAsync(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    // 🔥 FIX typo quan trọng
    if (productUpdateStatus === 'fulfilled') {
      toast.success('Sản phẩm đã được cập nhật thành công')
      navigate('/admin/dashboard')
    } else if (productUpdateStatus === 'rejected') {
      toast.error('Không thể cập nhật sản phẩm, vui lòng thử lại sau')
    }
  }, [navigate, productUpdateStatus])

  useEffect(() => {
    return () => {
      dispatch(clearSelectedProduct())
      dispatch(resetProductUpdateStatus())
    }
  }, [dispatch])

  const handleProductUpdate = (data) => {
    if (!selectedProduct) return

    const productUpdate = {
      id: selectedProduct._id,
      product: {
        title: data.title.trim(),
        brand: data.brand,
        category: data.category,
        description: data.description.trim(),
        price: data.price,
        stockQuantity: data.stockQuantity,
        thumbnail: data.thumbnail?.[0] || selectedProduct.thumbnail,
        images: productImageFieldNames
          .map((fieldName, index) => data[fieldName]?.[0] || selectedProduct.images?.[index])
          .filter(Boolean),
      },
    }

    dispatch(updateProductByIdAsync(productUpdate))
  }

  if (!selectedProduct) {
    return (
      <Box
        sx={{
          transform: 'scale(0.8)',
          transformOrigin: 'top left',
          width: '125%',
        }}
      >
        <AdminSurface
          title="Đang tải thông tin sản phẩm"
          description="Hệ thống đang lấy dữ liệu sản phẩm để bạn có thể cập nhật."
        />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        transform: 'scale(0.8)',
        transformOrigin: 'top left',
        width: '125%',
      }}
    >
      <ProductEditorForm
        key={selectedProduct._id}
        mode="update"
        introTitle="Tối ưu sản phẩm hiện tại"
        introDescription="Điều chỉnh nội dung, tồn kho và hình ảnh để sản phẩm luôn sẵn sàng bán."
        chips={[
          { icon: <EditRoundedIcon />, label: 'Chỉnh sửa nội dung' },
          { icon: <Inventory2RoundedIcon />, label: 'Kho và giá' },
          { icon: <PhotoLibraryRoundedIcon />, label: 'Làm mới hình ảnh' },
        ]}
        initialProduct={selectedProduct}
        brands={brands}
        categories={categories}
        submitStatus={productUpdateStatus}
        submitLabel="Lưu thay đổi"
        pendingLabel="Đang cập nhật..."
        onSubmit={handleProductUpdate}
      />
    </Box>
  )
}