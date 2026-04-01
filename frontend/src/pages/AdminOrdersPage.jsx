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
      title="Order Operations"
      description="Quan ly don hang theo trang thai, xu ly nhanh cac don moi va theo doi tien do giao van nhu mot seller center thuc te."
      actions={
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            component={Link}
            to="/admin/dashboard"
            variant="outlined"
            color="inherit"
            startIcon={<DashboardRoundedIcon />}
          >
            Ve tong quan
          </Button>
          <Button
            component={Link}
            to="/admin/add-product"
            variant="contained"
            startIcon={<AddBoxRoundedIcon />}
          >
            Them san pham
          </Button>
        </Stack>
      }
      stats={[
        { label: 'Focus', value: 'Fulfillment' },
        { label: 'Muc tieu', value: 'Xu ly nhanh' },
        { label: 'Che do', value: 'Order desk' },
      ]}
    >
      <AdminOrders />
    </AdminShell>
  )
}
