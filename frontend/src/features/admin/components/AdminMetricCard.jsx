import React from 'react'
import { Paper, Stack, Typography } from '@mui/material'

export const AdminMetricCard = ({ label, value, helper, icon, sx = {} }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        minHeight: 150,
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Stack rowGap={0.5}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={800}>
            {value}
          </Typography>
        </Stack>
        {icon}
      </Stack>
      {helper ? (
        <Typography mt={2} color="text.secondary" variant="body2">
          {helper}
        </Typography>
      ) : null}
    </Paper>
  )
}
