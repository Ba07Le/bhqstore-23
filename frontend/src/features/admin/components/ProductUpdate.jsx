import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
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
    if (productUpdateStatus === 'fullfilled') {
      toast.success('San pham da duoc cap nhat')
      navigate('/admin/dashboard')
    } else if (productUpdateStatus === 'rejected') {
      toast.error('Khong the cap nhat san pham, vui long thu lai sau')
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
      <AdminSurface
        title="Dang tai thong tin san pham"
        description="He thong dang lay du lieu listing de ban co the cap nhat."
      />
    )
  }

  return (
    <ProductEditorForm
      key={selectedProduct._id}
      mode="update"
      introTitle="Toi uu listing hien tai"
      introDescription="Dieu chinh noi dung, ton kho va media de giu listing luon san sang ban."
      chips={[
        { icon: <EditRoundedIcon />, label: 'Listing edit' },
        { icon: <Inventory2RoundedIcon />, label: 'Kho va gia' },
        { icon: <PhotoLibraryRoundedIcon />, label: 'Media refresh' },
      ]}
      initialProduct={selectedProduct}
      brands={brands}
      categories={categories}
      submitStatus={productUpdateStatus}
      submitLabel="Luu thay doi"
      pendingLabel="Dang cap nhat..."
      onSubmit={handleProductUpdate}
    />
  )
}
