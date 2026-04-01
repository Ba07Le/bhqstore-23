import React from 'react'
import { Button, Stack, Typography } from '@mui/material'

import { AdminSurface } from './AdminSurface'

export const AdminEmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <AdminSurface>
      <Stack alignItems="center" rowGap={1}>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
        <Typography color="text.secondary" textAlign="center">
          {description}
        </Typography>
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </AdminSurface>
  )
}
