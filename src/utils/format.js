export function money(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number.toFixed(2) : '0.00'
}

export function formatSold(value) {
  const number = Number(value || 0)
  if (number >= 10000) return `${(number / 10000).toFixed(1)}万+`
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k+`
  return `${number}+`
}
