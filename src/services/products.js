// 统一的数据请求入口：页面只关心平台配置，不直接拼接口地址。
export async function fetchCategories(platform) {
  const response = await fetch(platform.categoriesApi)
  if (!response.ok) throw new Error('分类请求失败')
  const data = await response.json()
  return Array.isArray(data.categories) ? data.categories : []
}

export async function fetchProducts(platform, { category, page, size, q }) {
  const params = new URLSearchParams({
    category: q ? '' : category,
    page: String(page),
    size: String(size),
    q: q || ''
  })
  const response = await fetch(`${platform.productsApi}?${params}`)
  if (!response.ok) throw new Error('商品请求失败')
  const data = await response.json()
  return {
    products: Array.isArray(data.products) ? data.products : [],
    hasMore: Boolean(data.hasMore),
    message: String(data.message || '')
  }
}

export async function createJdCommand(url) {
  const response = await fetch('/api/jd/command', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url })
  })
  if (!response.ok) throw new Error('京口令请求失败')
  const data = await response.json()
  return {
    command: String(data.command || ''),
    clickUrl: String(data.clickUrl || ''),
    source: String(data.source || 'fallback'),
    message: String(data.message || '')
  }
}

export async function createTpwd(url, text) {
  const response = await fetch('/api/tpwd', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, text })
  })
  const data = await response.json()
  return { password: data.password || '', source: data.source || 'taobao' }
}
