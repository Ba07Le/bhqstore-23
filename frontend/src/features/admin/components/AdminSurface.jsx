import React from 'react'
import { Paper, Stack, Typography } from '@mui/material'

export const AdminSurface = ({
  title,
  description,
  actions,
  children,
  sx = {},
  contentSx = {},
  ...props
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        ...sx,
      }}
      {...props}
    >
      {title || description || actions ? (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          gap={2}
          mb={children ? 2.5 : 0}
        >
          <Stack rowGap={0.6}>
            {title ? (
              <Typography variant="h6" fontWeight={800}>
                {title}
              </Typography>
            ) : null}
            {description ? (
              <Typography color="text.secondary">{description}</Typography>
            ) : null}
          </Stack>

          {actions}
        </Stack>
      ) : null}

      <Stack sx={contentSx}>{children}</Stack>
    </Paper>
  )
}
