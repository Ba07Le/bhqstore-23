import React from 'react'
import { Outlet } from 'react-router-dom'

import AIChatWidget from '../components/AIChatWidget'

export const RootLayout = () => {
  return (
    <main>
      <Outlet />
      <AIChatWidget />
    </main>
  )
}
