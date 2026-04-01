import { useSelector } from "react-redux"
import { selectLoggedInUser } from "../AuthSlice"
import { Navigate } from "react-router-dom"

export const Protected = ({children}) => {
    const loggedInUser = useSelector(selectLoggedInUser)

    // 1. Nếu có user và đã verify -> Cho phép vào trang đó
    if(loggedInUser && loggedInUser.isVerified){
        return children
    }

    // 2. Nếu ĐÃ LOGOUT (loggedInUser là null) -> Đẩy về TRANG CHỦ, không đẩy về Login
    if(!loggedInUser) {
        return <Navigate to={'/'} replace={true}/>
    }

    // 3. Các trường hợp khác (ví dụ có user nhưng chưa verify) -> Về Login
    return <Navigate to={'/login'} replace={true}/>
}
