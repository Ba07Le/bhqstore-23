export const formatCurrency = (value) => {
  const numericValue = Number(value) || 0

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(numericValue)
}
