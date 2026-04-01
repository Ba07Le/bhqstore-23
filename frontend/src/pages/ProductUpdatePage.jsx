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
      title="Catalog Optimization"
      description="Cap nhat listing, ton kho, media va thong tin gia ban trong mot khung quan tri nhat quan, de theo doi va toi uu nhanh hon."
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
        { label: 'Module', value: 'Listing edit' },
        { label: 'Focus', value: 'Cap nhat kho' },
        { label: 'Muc tieu', value: 'Toi uu chuyen doi' },
      ]}
    >
      <ProductUpdate />
    </AdminShell>
  )
}
