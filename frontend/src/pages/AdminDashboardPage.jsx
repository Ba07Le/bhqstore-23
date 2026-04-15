import React from 'react'
import { Button, Stack } from '@mui/material'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import { Link } from 'react-router-dom'

import { AdminDashBoard } from '../features/admin/components/AdminDashBoard'
import { AdminShell } from '../features/admin/components/AdminShell'

export const AdminDashboardPage = () => {
  return (
    <AdminShell
      title="Bảng điều khiển người bán"
      description="Theo dõi doanh thu, sức khỏe tồn kho, sản phẩm đang bán và các đầu việc quan trọng trong cùng một giao diện quản trị."
      
      actions={
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            component={Link}
            to="/admin/orders"
            variant="outlined"
            color="inherit"
            startIcon={<LocalMallRoundedIcon />}
          >
            Xem đơn hàng
          </Button>

          <Button
            component={Link}
            to="/admin/add-product"
            variant="contained"
            startIcon={<AddBoxRoundedIcon />}
          >
            Đăng sản phẩm
          </Button>
        </Stack>
      }

      stats={[
        { label: 'Không gian làm việc', value: 'Thương mại' },
        { label: 'Chế độ', value: 'Quản trị trực tiếp' },
        { label: 'Mục tiêu', value: 'Tăng doanh thu' },
      ]}
    >
      <AdminDashBoard />
    </AdminShell>
  )
}