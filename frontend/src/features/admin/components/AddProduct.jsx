import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import ImageRoundedIcon from '@mui/icons-material/ImageRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import SellRoundedIcon from '@mui/icons-material/SellRounded'
import { toast } from 'react-toastify'

import {
  addProductAsync,
  resetProductAddStatus,
  selectProductAddStatus,
} from '../../products/ProductSlice'
import { selectBrands } from '../../brands/BrandSlice'
import { selectCategories } from '../../categories/CategoriesSlice'
import { productImageFieldNames } from '../adminConfig'
import { ProductEditorForm } from './ProductEditorForm'

export const AddProduct = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const brands = useSelector(selectBrands)
  const categories = useSelector(selectCategories)
  const productAddStatus = useSelector(selectProductAddStatus)

  useEffect(() => {
    if (productAddStatus === 'fullfilled') {
      toast.success('San pham moi da duoc them vao catalog')
      navigate('/admin/dashboard')
    } else if (productAddStatus === 'rejected') {
      toast.error('Khong the them san pham, vui long thu lai sau')
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
      formData.append('images', data[fieldName][0])
    })

    dispatch(addProductAsync(formData))
  }

  return (
    <ProductEditorForm
      mode="create"
      introTitle="Tao listing moi"
      introDescription="Dien day du noi dung, gia, ton kho va media de san pham san sang dang ban."
      chips={[
        { icon: <SellRoundedIcon />, label: 'Catalog center' },
        { icon: <ImageRoundedIcon />, label: 'Media required' },
        { icon: <Inventory2RoundedIcon />, label: 'Ready to publish' },
      ]}
      brands={brands}
      categories={categories}
      submitStatus={productAddStatus}
      submitLabel="Luu va dang san pham"
      pendingLabel="Dang luu..."
      onSubmit={handleAddProduct}
    />
  )
}
