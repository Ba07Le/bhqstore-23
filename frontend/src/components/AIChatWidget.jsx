import React, { useEffect, useRef, useState } from 'react'
import {
  Badge,
  Box,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded'
import { useLocation } from 'react-router-dom'
import { axiosi } from '../config/axios'

const initialMessages = [
  {
    from: 'bot',
    text: 'Chào bạn, mình có thể hỗ trợ tư vấn sản phẩm, giao hàng và đơn hàng.',
  },
]

const bubbleStyles = {
  bot: {
    alignSelf: 'flex-start',
    backgroundColor: '#f4f1ea',
    color: '#1e1a16',
    borderRadius: '18px 18px 18px 6px',
  },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: '#161616',
    color: '#fff',
    borderRadius: '18px 18px 6px 18px',
  },
}

const AIChatWidget = () => {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      setOpen(false)
    }
  }, [location.pathname])

  const sendMessage = async () => {
    const trimmedInput = input.trim()

    if (!trimmedInput || typing) return

    setMessages((prev) => [...prev, { from: 'user', text: trimmedInput }])
    setInput('')
    setTyping(true)

    try {
      const res = await axiosi.post('/api/chat', {
        message: trimmedInput,
      })

      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text:
            res.data?.reply ||
            'Mình chưa lấy được phản hồi phù hợp, bạn thử hỏi lại giúp mình nhé.',
        },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text:
            'Hệ thống tư vấn đang bận một chút. Bạn thử lại sau hoặc tiếp tục mua hàng trên website nhé.',
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  if (location.pathname.startsWith('/admin')) {
    return null
  }

  return (
    <>
      <Badge
        color="success"
        overlap="circular"
        badgeContent=" "
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 1300,
        }}
      >
        <Fab
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            bgcolor: '#1e1a16',
            color: '#fff',
            '&:hover': { bgcolor: '#34302a' },
          }}
        >
          {open ? <CloseRoundedIcon /> : <SupportAgentRoundedIcon />}
        </Fab>
      </Badge>

      {open && (
        <Paper
          elevation={10}
          sx={{
            position: 'fixed',
            right: 20,
            bottom: 92,
            width: { xs: 'calc(100vw - 24px)', sm: 360 },
            maxWidth: 360,
            height: 500,
            borderRadius: 4,
            overflow: 'hidden',
            zIndex: 1300,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            px={2}
            py={1.5}
            sx={{
              background:
                'linear-gradient(135deg, rgba(30,26,22,1) 0%, rgba(64,52,44,1) 100%)',
              color: '#fff',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  display: 'grid',
                  placeItems: 'center',
                }}
              >
                <SmartToyOutlinedIcon />
              </Box>
              <Stack>
                <Typography fontWeight={700}>BHQ Assistant</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Tư vấn sản phẩm và hỗ trợ mua hàng
                </Typography>
              </Stack>
            </Stack>

            <IconButton onClick={() => setOpen(false)} sx={{ color: '#fff' }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Stack
            spacing={1.5}
            sx={{
              height: 370,
              overflowY: 'auto',
              p: 2,
              background:
                'radial-gradient(circle at top, rgba(246,241,234,0.7) 0%, rgba(255,255,255,1) 70%)',
            }}
          >
            {messages.map((message, index) => (
              <Box
                key={`${message.from}-${index}`}
                sx={{
                  ...bubbleStyles[message.from],
                  maxWidth: '82%',
                  px: 1.5,
                  py: 1.2,
                  boxShadow: '0 8px 24px rgba(15,15,15,0.06)',
                }}
              >
                <Typography variant="body2">{message.text}</Typography>
              </Box>
            ))}

            {typing && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  alignSelf: 'flex-start',
                  px: 1.5,
                  py: 1.2,
                  bgcolor: '#f4f1ea',
                  borderRadius: '18px 18px 18px 6px',
                }}
              >
                <CircularProgress size={14} />
                <Typography variant="body2">Đang phản hồi...</Typography>
              </Stack>
            )}

            <div ref={messagesEndRef} />
          </Stack>

          <Stack direction="row" spacing={1} p={1.5} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Hỏi về sản phẩm, giao hàng, đơn hàng..."
            />
            <IconButton
              onClick={sendMessage}
              disabled={!input.trim() || typing}
              sx={{
                bgcolor: '#1e1a16',
                color: '#fff',
                '&:hover': { bgcolor: '#34302a' },
                '&.Mui-disabled': { bgcolor: '#d7d7d7', color: '#888' },
              }}
            >
              <SendRoundedIcon />
            </IconButton>
          </Stack>
        </Paper>
      )}
    </>
  )
}

export default AIChatWidget
