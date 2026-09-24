import express from 'express'
import crypto from 'node:crypto'

const app = express()
const port = Number(process.env.API_PORT || 3001)
const appKey = process.env.TAOBAO_APPKEY || '33910417'
const secret = process.env.TAOBAO_SECRET || 'a3b055133cbecd6de2d1edbfed4ccd46'
const adzoneId = process.env.TAOBAO_ADZONE_ID || '112334700203'
const session = process.env.TAOBAO_SESSION || 'test'
const topUrl = process.env.TAOBAO_TOP_URL || 'https://eco.taobao.com/router/rest'

app.use(express.json({ limit: '256kb' }))

const categories = [
  { id: 'all', label: '精选', materialId: '96185', icon: 'ri-sparkling-2-line' },
  { id: 'beauty', label: '美妆', materialId: '96182', icon: 'ri-magic-line' },
  { id: 'home', label: '家居', materialId: '96185', icon: 'ri-home-5-line' },
  { id: 'fashion', label: '服饰', materialId: '96177', icon: 'ri-shirt-line' },
  { id: 'food', label: '美食', materialId: '96183', icon: 'ri-cake-3-line' },
  { id: 'digital', label: '数码', materialId: '96179', icon: 'ri-computer-line' },
  { id: 'mother', label: '母婴', materialId: '96181', icon: 'ri-bear-smile-line' },
  { id: 'entertainment', label: '文娱', materialId: '96180', icon: 'ri-movie-2-line' },
  { id: 'underwear', label: '内衣', materialId: '96178', icon: 'ri-user-heart-line' },
  { id: 'catmall', label: '猫超', materialId: '96184', icon: 'ri-shopping-bag-3-line' }
]

// 淘宝 TOP API 的签名：按参数名排序后用 Secret + 参数串 + Secret 计算 MD5。
function signTopParams(params) {
  const source = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join('')
  return crypto.createHash('md5').update(`${secret}${source}${secret}`, 'utf8').digest('hex').toUpperCase()
}

function buildTopParams(method, params = {}) {
  const base = {
    app_key: appKey,
    method,
    session,
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    format: 'json',
    v: '2.0',
    sign_method: 'md5',
    ...params
  }
  return { ...base, sign: signTopParams(base) }
}

async function callTop(method, params) {
  const body = new URLSearchParams(buildTopParams(method, params))
  const response = await fetch(topUrl, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' }, body })
  if (!response.ok) throw new Error(`淘宝接口返回 ${response.status}`)
  const data = await response.json()
  if (data.error_response) throw new Error(data.error_response.sub_msg || data.error_response.msg || '淘宝接口调用失败')
  return data
}

function pickFirst(value, fallback = '') {
  return value === undefined || value === null || value === '' ? fallback : value
}

// 把淘宝返回的嵌套商品对象整理成页面卡片需要的统一字段。
function normalizeProduct(item, index) {
  const base = item.item_basic_info || item
  const price = item.price_promotion_info || item
  const pathList = price.final_promotion_path_list?.final_promotion_path_map_data?.[0]
  const originalPrice = Number(pickFirst(price.zk_final_price, pickFirst(item.reserve_price, 0))) || 0
  const finalPrice = Number(pickFirst(price.final_promotion_price, pickFirst(item.zk_final_price, originalPrice))) || originalPrice
  const coupon = Number(pickFirst(pathList?.promotion_fee, pickFirst(item.coupon_amount, Math.max(0, originalPrice - finalPrice)))) || 0
  const link = pickFirst(item.publish_info?.coupon_share_url, pickFirst(item.coupon_share_url, pickFirst(item.publish_info?.click_url, item.click_url)))
  return {
    id: String(pickFirst(base.item_id, pickFirst(item.item_id, `taobao-${index}`))),
    title: pickFirst(base.title, pickFirst(item.title, '淘宝精选好物')),
    shop: pickFirst(base.shop_title, pickFirst(item.shop_title, '淘宝精选店铺')),
    image: String(pickFirst(base.pict_url, pickFirst(item.pict_url, ''))).replace(/^\/\//, 'https://'),
    originalPrice: Number(originalPrice.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    coupon: Number(coupon.toFixed(2)),
    sold: Number(pickFirst(item.publish_info?.daily_promotion_sales, pickFirst(item.publish_info?.two_hour_promotion_sales, pickFirst(base.volume, pickFirst(item.volume, 0))))) || 0,
    tag: coupon > 0 ? '官方优惠券' : '精选好价',
    link: link ? (String(link).startsWith('http') ? link : `https:${link}`) : ''
  }
}

function getMapData(data) {
  const result = data?.tbk_dg_material_recommend_response?.result_list?.map_data
    || data?.tbk_dg_material_optional_upgrade_response?.result_list?.map_data
    || []
  return Array.isArray(result) ? result : []
}

app.get('/api/categories', (_req, res) => {
  res.json({ categories })
})

app.get('/api/products', async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1))
  const size = Math.min(20, Math.max(1, Number(req.query.size || 12)))
  const query = String(req.query.q || '').trim()
  const category = categories.find(item => item.id === req.query.category) || categories[0]
  try {
    let data
    if (query) {
      data = await callTop('taobao.tbk.dg.material.optional.upgrade', {
        page_size: String(size),
        page_no: String(page),
        q: query,
        adzone_id: adzoneId
      })
    } else {
      data = await callTop('taobao.tbk.dg.material.recommend', {
        fields: 'user_id,item_id,title,pict_url,small_images,shop_title,volume,zk_final_price,reserve_price,coupon_amount,coupon_share_url,click_url',
        adzone_id: adzoneId,
        material_id: category.materialId,
        device_type: 'OAID',
        device_value: 'coupon-web',
        page_size: String(size),
        page_no: String(page)
      })
    }
    const products = getMapData(data).map(normalizeProduct).filter(product => product.link && product.image)
    if (!products.length) throw new Error('淘宝接口没有返回商品')
    res.json({ products, page, hasMore: products.length >= size, source: 'taobao' })
  } catch (error) {
    res.json({ products: [], page, hasMore: false, source: 'taobao', message: error.message })
  }
})

app.post('/api/tpwd', async (req, res) => {
  const url = String(req.body?.url || '').trim()
  const text = String(req.body?.text || '省心券优惠商品').trim()
  if (!url) return res.status(400).json({ message: '缺少商品链接' })
  try {
    const data = await callTop('taobao.tbk.tpwd.create', { url, text })
    const result = data?.tbk_tpwd_create_response?.data || {}
    const password = result.model || result.password_simple || result.password || ''
    if (!password) throw new Error('淘宝没有返回淘口令')
    res.json({ password, source: 'taobao' })
  } catch (error) {
    res.json({ password: url, source: 'fallback', message: error.message })
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(port, () => {
  console.log(`Coupon API listening on http://localhost:${port}`)
})
