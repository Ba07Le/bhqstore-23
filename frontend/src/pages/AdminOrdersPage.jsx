import React from 'react'
import { Button, Stack } from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import { Link } from 'react-router-dom'

import { AdminOrders } from '../features/admin/components/AdminOrders'
import { AdminShell } from '../features/admin/components/AdminShell'

export const AdminOrdersPage = () => {
  return (
    <AdminShell
      title="Vận hành đơn hàng"
      description="Quản lý đơn hàng theo trạng thái, xử lý nhanh các đơn mới và theo dõi tiến độ giao vận như một trung tâm người bán thực tế."
      actions={
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            component={Link}
            to="/admin/dashboard"
            variant="outlined"
            color="inherit"
            startIcon={<DashboardRoundedIcon />}
          >
            Về tổng quan
          </Button>
          <Button
            component={Link}
            to="/admin/add-product"
            variant="contained"
            startIcon={<AddBoxRoundedIcon />}
          >
            Thêm sản phẩm
          </Button>
        </Stack>
      }
      stats={[
        { label: 'Trọng tâm', value: 'Hoàn tất đơn' },
        { label: 'Mục tiêu', value: 'Xử lý nhanh' },
        { label: 'Chế độ', value: 'Bàn làm việc' },
      ]}
    >
      <AdminOrders />
    </AdminShell>
  )
}