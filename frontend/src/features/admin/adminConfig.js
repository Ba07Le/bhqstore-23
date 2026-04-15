import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'

export const adminNavigationItems = [
  {
    label: 'Tổng quan',
    helper: 'Doanh thu, kho, hiệu suất',
    path: '/admin/dashboard',
    icon: <DashboardRoundedIcon />,
  },
  {
    label: 'Đơn hàng',
    helper: 'Xử lý và cập nhật vận đơn',
    path: '/admin/orders',
    icon: <LocalMallRoundedIcon />,
  },
  {
    label: 'Thêm sản phẩm',
    helper: 'Tạo listing mới',
    path: '/admin/add-product',
    icon: <AddBoxRoundedIcon />,
  },
]

export const analyticsRangeOptions = [
  { value: '7d', label: '7 ngày qua' },
  { value: '30d', label: '30 ngày qua' },
  { value: '90d', label: '90 ngày qua' },
  { value: '12m', label: '12 tháng qua' },
  { value: 'all', label: 'Toàn bộ thời gian' },
]

export const productSortOptions = [
  { name: 'Mới nhất', sort: 'createdAt', order: 'desc' },
  { name: 'Cũ nhất', sort: 'createdAt', order: 'asc' },
  { name: 'Giá thấp đến cao', sort: 'price', order: 'asc' },
  { name: 'Giá cao đến thấp', sort: 'price', order: 'desc' },
]

export const stockFilterOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Còn hàng', value: 'in' },
  { label: 'Sắp hết hàng', value: 'low' },
  { label: 'Hết hàng', value: 'out' },
]

export const visibilityFilterOptions = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đang hiển thị', value: 'active' },
  { label: 'Tạm ẩn', value: 'deleted' },
]

export const orderStatusOptions = [
  'Đang chờ xử lý',
  'Đã gửi',
  'Đang giao hàng',
  'Đã giao',
  'Đã hủy',
]

export const paymentFilterOptions = ['Tất cả', 'COD', 'MOMO', 'VNPAY', 'UPI', 'CARD']

export const productImageFieldNames = ['image0', 'image1', 'image2', 'image3']