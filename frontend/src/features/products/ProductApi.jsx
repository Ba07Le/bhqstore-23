import { axiosi } from "../../config/axios";

export const addProduct=async(data)=>{
    try {
        const res=await axiosi.post('/products',data)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const fetchProducts=async(filters)=>{
    const params = new URLSearchParams()

    if(filters.search){
        params.append('search', filters.search)
    }

    if(filters.admin){
        params.append('admin', 'true')
    }

    if(filters.brand){
        filters.brand.forEach((brand)=>{
            params.append('brand', brand)
        })
    }

    if(filters.category){
        filters.category.forEach((category)=>{
            params.append('category', category)
        })
    }

    if(filters.pagination){
        params.append('page', filters.pagination.page)
        params.append('limit', filters.pagination.limit)
    }

    if(filters.sort){
        params.append('sort', filters.sort.sort)
        params.append('order', filters.sort.order)
    }

    if(filters.user){
        params.append('user', filters.user)
    }

    if(typeof filters.isDeleted === 'boolean'){
        params.append('isDeleted', filters.isDeleted)
    }

    if(filters.stockStatus){
        params.append('stockStatus', filters.stockStatus)
    }
    
    try {
        const res=await axiosi.get(`/products?${params.toString()}`)
        const totalResults=res.headers.get?.("X-Total-Count") || res.headers["x-total-count"] || 0
        return {data:res.data,totalResults:totalResults}
    } catch (error) {
        throw error.response.data
    }
}

export const fetchProductById=async(id)=>{
    try {
        const res=await axiosi.get(`/products/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const updateProductById = async ({ id, product }) => {
  const formData = new FormData()

  Object.keys(product).forEach((key) => {
    if (key === "images") {
      product.images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images", img)
        } else {
          formData.append("oldImages", img)
        }
      })
    } else if (key === "thumbnail") {
      if (product.thumbnail instanceof File) {
        formData.append("thumbnail", product.thumbnail)
      } else {
        formData.append("oldThumbnail", product.thumbnail)
      }
    } else {
      formData.append(key, product[key])
    }
  })

  const res = await axiosi.patch(`/products/${id}`, formData)
  return res.data
}

export const undeleteProductById=async(id)=>{
    try {
        const res=await axiosi.patch(`/products/undelete/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const deleteProductById=async(id)=>{
    try {
        const res=await axiosi.delete(`/products/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
