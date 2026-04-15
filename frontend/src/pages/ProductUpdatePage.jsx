import React from 'react'
import { Button, Stack } from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import { Link } from 'react-router-dom'

import { ProductUpdate } from '../features/admin/components/ProductUpdate'
import { AdminShell } from '../features/admin/components/AdminShell'

export const ProductUpdatePage = () => {
  return (
    <AdminShell
      title="Tối ưu hóa Danh mục"
      description="Cập nhật sản phẩm, tồn kho, hình ảnh và thông tin giá bán trong một khung quản trị nhất quán, dễ theo dõi và tối ưu nhanh hơn."
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
        { label: 'Chức năng', value: 'Chỉnh sửa sản phẩm' },
        { label: 'Trọng tâm', value: 'Cập nhật kho' },
        { label: 'Mục tiêu', value: 'Tối ưu chuyển đổi' },
      ]}
    >
      <ProductUpdate />
    </AdminShell>
  )
}