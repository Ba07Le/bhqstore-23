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
      title="Seller Center Dashboard"
      description="Theo doi doanh thu, suc khoe ton kho, san pham dang ban va cac dau viec quan trong trong cung mot bo giao dien quan tri."
      actions={
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Button
            component={Link}
            to="/admin/orders"
            variant="outlined"
            color="inherit"
            startIcon={<LocalMallRoundedIcon />}
          >
            Xem don hang
          </Button>
          <Button
            component={Link}
            to="/admin/add-product"
            variant="contained"
            startIcon={<AddBoxRoundedIcon />}
          >
            Dang san pham
          </Button>
        </Stack>
      }
      stats={[
        { label: 'Workspace', value: 'Commerce' },
        { label: 'Che do', value: 'Live admin' },
        { label: 'Muc tieu', value: 'Tang doanh thu' },
      ]}
    >
      <AdminDashBoard />
    </AdminShell>
  )
}
