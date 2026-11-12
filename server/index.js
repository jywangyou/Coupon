import express from 'express'
import { pathToFileURL } from 'node:url'
import { taobaoCategories, fetchTaobaoProducts, createTaobaoTpwd } from './taobao.js'
import { jdCategories, fetchJdProducts, createJdCommand } from './jd.js'

const app = express()
const port = Number(process.env.API_PORT || 3001)

app.use(express.json({ limit: '256kb' }))

// 返回给前端的分类只需要展示字段
const publicJdCategories = jdCategories.map(({ id, label, icon }) => ({ id, label, icon }))

app.get('/api/categories', (_req, res) => {
  res.json({ categories: taobaoCategories.map(({ id, label, icon }) => ({ id, label, icon })) })
})

app.get('/api/products', async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1))
  const size = Math.min(20, Math.max(1, Number(req.query.size || 12)))
  const query = String(req.query.q || '').trim()
  try {
    const { products, hasMore, debug } = await fetchTaobaoProducts({
      categoryId: String(req.query.category || 'all'),
      page,
      size,
      query
    })
    res.json({ products, page, hasMore, source: 'taobao', debug })
  } catch (error) {
    console.error('[/api/products] error:', error.message, { category: req.query.category, page })
    res.json({ products: [], page, hasMore: false, source: 'taobao', message: error.message })
  }
})

app.post('/api/tpwd', async (req, res) => {
  const url = String(req.body?.url || '').trim()
  const text = String(req.body?.text || '省心券优惠商品').trim()
  if (!url) return res.status(400).json({ message: '缺少商品链接' })
  try {
    const password = await createTaobaoTpwd(url, text)
    res.json({ password, source: 'taobao' })
  } catch (error) {
    res.json({ password: url, source: 'fallback', message: error.message })
  }
})

app.get('/api/jd/categories', (_req, res) => {
  res.json({ categories: publicJdCategories })
})

app.get('/api/jd/products', async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1))
  const size = Math.min(20, Math.max(1, Number(req.query.size || 12)))
  const query = String(req.query.q || '').trim()
  try {
    const { products, hasMore, totalCount, message } = await fetchJdProducts({
      categoryId: String(req.query.category || 'all'),
      page,
      size,
      query
    })
    res.json({ products, page, hasMore, totalCount, source: 'jd', ...(message ? { message } : {}) })
  } catch (error) {
    console.error('[/api/jd/products] error:', error.message, { category: req.query.category, page })
    res.json({ products: [], page, hasMore: false, source: 'jd', message: error.message })
  }
})

app.post('/api/jd/command', async (req, res) => {
  const url = String(req.body?.url || '').trim()
  if (!url) return res.status(400).json({ message: '缺少商品链接' })
  try {
    const { command, clickUrl } = await createJdCommand(url)
    res.json({ command, clickUrl, source: command ? 'jd-command' : 'jd-link' })
  } catch (error) {
    console.error('[/api/jd/command] error:', error.message)
    res.json({ command: '', clickUrl: '', source: 'fallback', message: error.message })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Only listen when this file is executed directly. Vercel imports the app.
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMainModule) {
  app.listen(port, () => {
    console.log(`Coupon API listening on http://localhost:${port}`)
  })
}

export default app
