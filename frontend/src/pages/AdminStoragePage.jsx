import React from 'react'
import { Button, Stack } from '@mui/material'
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded'
import LocalMallRoundedIcon from '@mui/icons-material/LocalMallRounded'
import { Link } from 'react-router-dom'

import { AdminStorage } from '../features/admin/components/AdminStorage'
import { AdminShell } from '../features/admin/components/AdminShell'

export const AdminStoragePage = () => {
  return (
    <AdminShell
      title="Theo dõi kho tồn"
      description="Theo dõi tồn kho, quản lí sản phẩm hết hàng, còn hàng, sắp hết, dễ dàng xử lí sản phẩm."
      
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
      <AdminStorage />
    </AdminShell>
  )
}