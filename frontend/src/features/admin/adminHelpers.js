export const normalizeText = (value = '') =>
  String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export const getInitials = (name = '') => {
  const words = String(name).trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'AD'
  return words.slice(0, 2).map((word) => word[0].toUpperCase()).join('')
}

export const formatAdminHeaderDate = () =>
  new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export const getStockMeta = (stockQuantity = 0) => {
  if (stockQuantity <= 0) {
    return {
      label: 'Het hang',
      color: 'error',
      progress: 0,
      helper: 'Can bo sung ngay',
    }
  }

  if (stockQuantity <= 20) {
    return {
      label: 'Sap het',
      color: 'warning',
      progress: Math.min((stockQuantity / 20) * 100, 100),
      helper: `Con ${stockQuantity} san pham`,
    }
  }

  return {
    label: 'On dinh',
    color: 'success',
    progress: Math.min((stockQuantity / 100) * 100, 100),
    helper: `Con ${stockQuantity} san pham`,
  }
}

export const getVisibilityMeta = (product) =>
  product?.isDeleted
    ? { label: 'Tam an', color: 'error' }
    : { label: 'Dang ban', color: 'success' }

export const getOrderAddress = (address) => {
  if (Array.isArray(address)) {
    return address[0] || {}
  }

  return address || {}
}

export const getOrderStatusStyles = (status) => {
  const normalized = normalizeText(status)

  if (normalized.includes('dang cho xu ly')) {
    return { bgcolor: '#fff7ed', color: '#c2410c' }
  }
  if (normalized.includes('da gui')) {
    return { bgcolor: '#eff6ff', color: '#1d4ed8' }
  }
  if (normalized.includes('dang giao hang')) {
    return { bgcolor: '#e0f2fe', color: '#0369a1' }
  }
  if (normalized.includes('da giao')) {
    return { bgcolor: '#ecfdf3', color: '#166534' }
  }
  if (normalized.includes('da huy')) {
    return { bgcolor: '#fef2f2', color: '#b91c1c' }
  }

  return { bgcolor: '#f4f4f5', color: '#3f3f46' }
}

export const getPaymentStatusMeta = (status = '') => {
  const normalized = normalizeText(status)

  if (normalized.includes('paid')) {
    return { label: 'Da thanh toan', color: 'success' }
  }
  if (normalized.includes('failed')) {
    return { label: 'That bai', color: 'error' }
  }
  if (normalized.includes('cancelled')) {
    return { label: 'Da huy', color: 'error' }
  }
  if (normalized.includes('cod_pending')) {
    return { label: 'COD cho thu', color: 'warning' }
  }

  return { label: 'Cho thanh toan', color: 'warning' }
}

export const getOrderSearchText = (order) => {
  const address = getOrderAddress(order.address)
  const addressText = [address.street, address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(' ')

  const itemsText = (order.item || [])
    .map((product) => product?.product?.title)
    .filter(Boolean)
    .join(' ')

  return [
    order._id,
    order.status,
    order.paymentMode,
    order.user?.name,
    order.user?.email,
    addressText,
    itemsText,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export const getCustomerName = (order) =>
  order?.user?.name || order?.user?.email || order?.name || 'Khach le'

export const getCustomerMeta = (order) => {
  const address = getOrderAddress(order.address)
  return (
    order?.user?.email ||
    [address.city, address.state].filter(Boolean).join(', ') ||
    'Khach mua tren website'
  )
}

export const getProductEditorChecklist = ({
  title,
  brand,
  category,
  description,
  price,
  stockQuantity,
  hasThumbnail,
  imageCount,
  requireFullGallery = false,
  targetImageCount = 4,
}) => [
  { label: 'Ten san pham', done: Boolean(title?.trim()) },
  { label: 'Brand va danh muc', done: Boolean(brand && category) },
  { label: 'Mo ta chi tiet', done: Boolean(description?.trim()?.length >= 10) },
  { label: 'Gia ban', done: Boolean(Number(price) > 0) },
  {
    label: 'Ton kho',
    done: stockQuantity !== undefined && stockQuantity !== null && Number(stockQuantity) >= 0,
  },
  {
    label: 'Media',
    done: hasThumbnail && (requireFullGallery ? imageCount === targetImageCount : imageCount > 0),
  },
]
