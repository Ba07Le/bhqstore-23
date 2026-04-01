import React from 'react'
import { Button, Paper, Stack, Typography } from '@mui/material'

export class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App crashed:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Stack minHeight="100vh" alignItems="center" justifyContent="center" px={2}>
          <Paper elevation={2} sx={{ maxWidth: 520, p: 4, borderRadius: 4 }}>
            <Stack rowGap={2}>
              <Typography variant="h5" fontWeight={700}>
                Co loi khi tai giao dien
              </Typography>
              <Typography color="text.secondary">
                Ung dung vua gap loi ngoai mong muon. Ban co the tai lai trang de thu lai.
              </Typography>
              <Button variant="contained" onClick={this.handleReload}>
                Tai lai trang
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )
    }

    return this.props.children
  }
}
