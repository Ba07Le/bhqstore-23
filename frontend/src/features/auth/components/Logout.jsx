import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logoutAsync, selectLoggedInUser } from '../AuthSlice'
import { useNavigate } from 'react-router-dom'

export const Logout = () => {
    const dispatch = useDispatch()
    const loggedInUser = useSelector(selectLoggedInUser)
    const navigate = useNavigate()

    useEffect(() => {
        dispatch(logoutAsync())
    }, [dispatch]) // Thêm dispatch vào dependency cho đúng chuẩn React

    useEffect(() => {
        // Sửa "/homepage" thành "/" vì Route trang chủ của Bảo là "/"
        if (!loggedInUser) {
            navigate("/", { replace: true }) 
        }
    }, [loggedInUser, navigate])

  return (
    <></>
  )
}