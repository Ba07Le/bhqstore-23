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
      title="Catalog Creation"
      description="Tao san pham moi voi thong tin ro rang, media day du va mot bo giao dien nhap lieu gan voi quy trinh van hanh thuong mai."
      actions={
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            component={Link}
            to="/admin/dashboard"
            variant="outlined"
            color="inherit"
            startIcon={<DashboardRoundedIcon />}
          >
            Ve dashboard
          </Button>
          <Button
            component={Link}
            to="/admin/orders"
            variant="contained"
            startIcon={<LocalMallRoundedIcon />}
          >
            Xem don hang
          </Button>
        </Stack>
      }
      stats={[
        { label: 'Module', value: 'Catalog' },
        { label: 'Checklist', value: 'Media + gia' },
        { label: 'Muc tieu', value: 'Dang ban nhanh' },
      ]}
    >
      <AddProduct />
    </AdminShell>
  )
}
