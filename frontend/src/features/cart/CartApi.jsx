import {axiosi} from '../../config/axios'

export const addToCart = async (item) => {
    try {
        console.log("SEND TO BACKEND:", item); 

        const res = await axiosi.post('/cart', item);

        console.log("BACKEND RESPONSE:", res.data); 

        return res.data;
    } catch (error) {
        console.log("ERROR:", error.response?.data); 
        throw error.response.data;
    }
}
export const fetchCartByUserId=async(id)=>{
    try {
        const res=await axiosi.get(`/cart/user/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const updateCartItemById=async(update)=>{
    try {
        const res=await axiosi.patch(`/cart/${update._id}`,update)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
export const deleteCartItemById=async(id)=>{
    try {
        const res=await axiosi.delete(`/cart/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const resetCartByUserId=async(userId)=>{
    try {
        const res=await axiosi.delete(`/cart/user/${userId}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
