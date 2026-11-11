import express from 'express'
import crypto from 'node:crypto'
import { pathToFileURL } from 'node:url'

const app = express()
const port = Number(process.env.API_PORT || 3001)
const appKey = process.env.TAOBAO_APPKEY || '33910417'
const secret = process.env.TAOBAO_SECRET || 'a3b055133cbecd6de2d1edbfed4ccd46'
const adzoneId = process.env.TAOBAO_ADZONE_ID || '112334700203'
const session = process.env.TAOBAO_SESSION || 'test'
const topUrl = process.env.TAOBAO_TOP_URL || 'https://eco.taobao.com/router/rest'

app.use(express.json({ limit: '256kb' }))

const categories = [
  { id: 'all', label: '精选', materialIds: ['27446','13366','3786','3756','30443','28026','96177','96180','96184','96185'], icon: 'ri-sparkling-2-line' },
  { id: 'food', label: '食品', materialIds: ['27451','13375','96183','3791','86614','3761'], icon: 'ri-cake-3-line' },
  { id: 'daily', label: '天天特卖', materialIds: ['31362','86594','39313','86595','44413','86589'], icon: 'ri-flashlight-line' },
  { id: 'women', label: '女装', materialIds: ['27448','13367','3788','86623','3767'], icon: 'ri-shirt-line' },
  { id: 'men', label: '男装', materialIds: ['13372','3790','86618','3764'], icon: 'ri-windy-line' },
  { id: 'beauty', label: '美妆个护', materialIds: ['27453','13371','96182','3794','86619','3763'], icon: 'ri-magic-line' },
  { id: 'home', label: '家居家装', materialIds: ['27798','13368','3792','86622','3758'], icon: 'ri-home-5-line' },
  { id: 'mother', label: '母婴', materialIds: ['27454','13374','96181','3789','86616','3760','4040','4041','4044','4042','4043','4045'], icon: 'ri-bear-smile-line' },
  { id: 'digital', label: '数码家电', materialIds: ['96179','13369','3793','86621','3759'], icon: 'ri-computer-line' },
  { id: 'shoes', label: '鞋包配饰', materialIds: ['13370','3796','86620','3762'], icon: 'ri-briefcase-3-line' },
  { id: 'underwear', label: '内衣', materialIds: ['13373','96178','3787','86617','3765'], icon: 'ri-user-heart-line' },
  { id: 'sport', label: '运动户外', materialIds: ['13376','3795','86615','3766'], icon: 'ri-bike-line' },
  { id: 'pet', label: '宠物', materialIds: ['78393','78393'], icon: 'ri-baidu-line' }
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
  const primaryImage = String(pickFirst(base.pict_url, pickFirst(item.pict_url, ''))).replace(/^\/\//, 'https://')
  const images = [primaryImage].filter(Boolean)
  const isValidImageUrl = (u) => /^https?:\/\/.+/.test(u) && !/^(undefined|null|object|object\[)\]/i.test(u)
  for (const field of [base, item]) {
    const si = field?.small_images
    if (Array.isArray(si)) {
      si.map(s => String(s).replace(/^\/\//, 'https://')).filter(isValidImageUrl).forEach(u => { if (!images.includes(u)) images.push(u) })
    } else if (typeof si === 'string') {
      si.split(',').map(s => s.trim().replace(/^\/\//, 'https://')).filter(isValidImageUrl).forEach(u => { if (!images.includes(u)) images.push(u) })
    }
  }
  if (images.length === 1 && !isValidImageUrl(images[0])) return null
  return {
    id: String(pickFirst(base.item_id, pickFirst(item.item_id, `taobao-${index}`))),
    title: pickFirst(base.title, pickFirst(item.title, '淘宝精选好物')),
    shop: pickFirst(base.shop_title, pickFirst(item.shop_title, '淘宝精选店铺')),
    image: primaryImage,
    images,
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

// 跨请求物料进度记录：每个分类记录当前游标位置
// key: categoryId, value: { materialIdx, pageNo, hasMoreInCurrent }
const materialCursor = new Map()

function getCursor(categoryId, idsLength) {
  let c = materialCursor.get(categoryId)
  if (!c || c.materialIdx >= idsLength) {
    c = { materialIdx: 0, pageNo: 1, hasMoreInCurrent: true }
    materialCursor.set(categoryId, c)
  }
  return c
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
    if (query) {
      const data = await callTop('taobao.tbk.dg.material.optional.upgrade', {
        page_size: String(size),
        page_no: String(page),
        q: query,
        adzone_id: adzoneId
      })
      const products = getMapData(data).map(normalizeProduct).filter(p => p.link && p.image)
      if (!products.length) throw new Error('淘宝接口没有返回商品')
      res.json({ products, page, hasMore: products.length >= size, source: 'taobao' })
    } else {
      // 多物料ID顺序翻页：
      // 每个物料内部翻页，翻完（数据不足size）才切到下一个物料的第1页
      // 用游标记录每个分类的进度，跨请求累加
      const ids = category.materialIds
      const cursor = getCursor(category.id, ids.length)

      // 前端主动重新请求第1页时重置游标
      if (page === 1) {
        cursor.materialIdx = 0
        cursor.pageNo = 1
        cursor.hasMoreInCurrent = true
      }

      let products = []
      let rawCount = 0
      let currentMaterial = ''
      let consumedAll = true // 所有物料是否都翻完了

      for (let i = 0; i < ids.length; i++) {
        const idx = (cursor.materialIdx + i) % ids.length
        currentMaterial = ids[idx]
        const pNo = i === 0 ? cursor.pageNo : 1
        const data = await callTop('taobao.tbk.dg.material.recommend', {
          fields: 'user_id,item_id,title,pict_url,small_images,shop_title,volume,zk_final_price,reserve_price,coupon_amount,coupon_share_url,click_url',
          adzone_id: adzoneId,
          material_id: currentMaterial,
          device_type: 'MOBILE',
          device_value: 'coupon-web',
          page_size: String(size),
          page_no: String(pNo)
        })
        const raw = getMapData(data)
        rawCount = raw.length
        const norm = raw.map(normalizeProduct).filter(p => p.link && p.image)
        const filled = norm.length >= size

        if (i === 0) {
          // 当前游标物料：请求第 pageNo 页
          products = norm
          if (filled) {
            cursor.pageNo++
            cursor.hasMoreInCurrent = true
            consumedAll = false
          } else {
            // 当前物料翻完，切到下一个
            cursor.materialIdx = (cursor.materialIdx + 1) % ids.length
            cursor.pageNo = 1
            cursor.hasMoreInCurrent = ids.length > 1
            // 如果只有1个物料且翻完了，就结束
            if (ids.length === 1) consumedAll = true
          }
          break
        } else {
          // fallback 到第 i 个物料：请求第1页
          products = norm
          if (filled) {
            cursor.materialIdx = idx
            cursor.pageNo = 2
            cursor.hasMoreInCurrent = true
            consumedAll = false
          } else {
            // 这个物料第1页也不足，继续 fallback
            if (i === ids.length - 1) {
              // 最后一个物料也不足 → 全部翻完
              cursor.materialIdx = 0
              cursor.pageNo = 1
              cursor.hasMoreInCurrent = false
              consumedAll = true
            } else {
              // 继续下一个
              cursor.materialIdx = (idx + 1) % ids.length
              cursor.pageNo = 1
            }
            products = []
            continue
          }
          break
        }
      }

      const hasMore = !consumedAll
      res.json({ products, page, hasMore, source: 'taobao', debug: { material_id: currentMaterial, raw_count: rawCount, cursor: { materialIdx: cursor.materialIdx, pageNo: cursor.pageNo, hasMoreInCurrent: cursor.hasMoreInCurrent, consumedAll } } })
    }
  } catch (error) {
    console.error('[/api/products] error:', error.message, { category: category.id, page })
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

// Only listen when this file is executed directly. Vercel imports the app.
const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMainModule) {
  app.listen(port, () => {
    console.log(`Coupon API listening on http://localhost:${port}`)
  })
}

export default app
