import React from 'react'
import { Button, Stack } from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import { Link } from 'react-router-dom'

import { AddProduct } from '../features/admin/components/AddProduct'
import { AdminShell } from '../features/admin/components/AdminShell'

export const AddProductPage = () => {
  return (
    <AdminShell
      title="Khởi tạo danh mục"
      description="Tạo sản phẩm mới với thông tin rõ ràng, hình ảnh đầy đủ và bộ giao diện nhập liệu tối ưu cho quy trình vận hành thương mại."
      actions={
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            component={Link}
            to="/admin/dashboard"
            variant="outlined"
            color="inherit"
            startIcon={<DashboardRoundedIcon />}
          >
            Về bảng điều khiển
          </Button>
          <Button
            component={Link}
            to="/admin/orders"
            variant="contained"
            startIcon={<LocalMallRoundedIcon />}
          >
            Xem đơn hàng
          </Button>
        </Stack>
      }
      stats={[
        { label: 'Phân hệ', value: 'Danh mục' },
        { label: 'Kiểm tra', value: 'Hình ảnh + Giá' },
        { label: 'Mục tiêu', value: 'Đăng bán nhanh' },
      ]}
    >
      <AddProduct />
    </AdminShell>
  )
}