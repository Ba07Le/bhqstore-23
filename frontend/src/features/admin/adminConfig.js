import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'

export const adminNavigationItems = [
  {
    label: 'Tong quan',
    helper: 'Doanh thu, kho, hieu suat',
    path: '/admin/dashboard',
    icon: <DashboardRoundedIcon />,
  },
  {
    label: 'Don hang',
    helper: 'Xu ly va cap nhat van don',
    path: '/admin/orders',
    icon: <LocalMallRoundedIcon />,
  },
  {
    label: 'Them san pham',
    helper: 'Tao listing moi',
    path: '/admin/add-product',
    icon: <AddBoxRoundedIcon />,
  },
]

export const analyticsRangeOptions = [
  { value: '7d', label: '7 ngay' },
  { value: '30d', label: '30 ngay' },
  { value: '90d', label: '90 ngay' },
  { value: '12m', label: '12 thang' },
  { value: 'all', label: 'Toan bo' },
]

export const productSortOptions = [
  { name: 'Moi nhat', sort: 'createdAt', order: 'desc' },
  { name: 'Cu nhat', sort: 'createdAt', order: 'asc' },
  { name: 'Gia thap den cao', sort: 'price', order: 'asc' },
  { name: 'Gia cao den thap', sort: 'price', order: 'desc' },
]

export const stockFilterOptions = [
  { label: 'Tat ca', value: 'all' },
  { label: 'Con hang', value: 'in' },
  { label: 'Sap het', value: 'low' },
  { label: 'Het hang', value: 'out' },
]

export const visibilityFilterOptions = [
  { label: 'Tat ca', value: 'all' },
  { label: 'Dang ban', value: 'active' },
  { label: 'Tam an', value: 'deleted' },
]

export const orderStatusOptions = [
  'Đang chờ xử lý',
  'Đã gửi',
  'Đang giao hàng',
  'Đã giao',
  'Đã hủy',
]

export const paymentFilterOptions = ['Tat ca', 'COD', 'MOMO', 'VNPAY', 'UPI', 'CARD']

export const productImageFieldNames = ['image0', 'image1', 'image2', 'image3']
