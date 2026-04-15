import React, { useEffect, useRef } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import { Footer } from '../features/footer/Footer'
import { Introduce } from '../features/introduce/Introduce'
import { Features } from '../features/introduce/Features'

export const HomePage = () => {

  const dispatch = useDispatch()
  const addressStatus = useSelector(selectAddressStatus)

  // 👇 tạo ref
  const productRef = useRef(null)
  const featureRef = useRef(null)

  useEffect(()=>{
    if(addressStatus==='fulfilled'){
      dispatch(resetAddressStatus())
    }
  },[addressStatus])

  // 👇 function scroll
  const scrollToProducts = () => {
    productRef.current?.scrollIntoView({ behavior: "smooth" })
  }

    // 👉 scroll tới features
  const scrollToFeatures = () => {
    featureRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <Navbar isProductList={true}/>

      {/* truyền function xuống */}
      <Introduce 
      onScrollToProducts={scrollToProducts}
      onScrollToFeatures={scrollToFeatures}
      />  

      {/* gắn ref vào đây */}
      <div ref={productRef}>
        <ProductList/>
      </div>

      
        {/* gắn ref */}
      <div ref={featureRef}>
        <Features/>
      </div>

      <Footer/>
    </>
  )
}