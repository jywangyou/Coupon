import crypto from 'node:crypto'

const appKey = process.env.JD_APPKEY || 'd464919324de83da50d6f88c61cf636a'
const secret = process.env.JD_SECRET || '3df2dab3323e4943b26384832be12765'
// 联盟ID_应用ID_推广位ID
const pid = process.env.JD_PID || '2038416471_4109815216_3110304933'
const siteId = process.env.JD_SITE_ID || '4109815216'
const accessToken = process.env.JD_ACCESS_TOKEN || ''
const apiUrl = process.env.JD_API_URL || 'https://api.jd.com/routerjson'

// 京东联盟精选频道（eliteId 取自《京粉精选商品查询接口》文档）
export const jdCategories = [
  { id: 'all', label: '精选', eliteId: 1, icon: 'ri-sparkling-2-line' },
  { id: 'hot', label: '实时热销', eliteId: 22, icon: 'ri-fire-line' },
  { id: 'recommend', label: '为你推荐', eliteId: 23, icon: 'ri-heart-3-line' },
  { id: 'nine', label: '9.9包邮', eliteId: 10, icon: 'ri-price-tag-3-line' },
  { id: 'delivery', label: '京东配送', eliteId: 15, icon: 'ri-truck-line' },
  { id: 'self', label: '自营好物', eliteId: 110, icon: 'ri-shield-star-line' },
  { id: 'digital', label: '数码家电', eliteId: 24, icon: 'ri-computer-line' },
  { id: 'supermarket', label: '京东超市', eliteId: 25, icon: 'ri-shopping-basket-2-line' },
  { id: 'mother', label: '母婴玩具', eliteId: 26, icon: 'ri-bear-smile-line' },
  { id: 'home', label: '家具日用', eliteId: 27, icon: 'ri-home-5-line' },
  { id: 'beauty', label: '美妆穿搭', eliteId: 28, icon: 'ri-magic-line' },
  { id: 'book', label: '图书文具', eliteId: 30, icon: 'ri-book-open-line' },
  { id: 'today', label: '今日必推', eliteId: 31, icon: 'ri-thumb-up-line' },
  { id: 'seckill', label: '京东秒杀', eliteId: 33, icon: 'ri-flashlight-line' }
]

// 京东 JOS 签名：参数名排序后拼接 key + value，再用 secret 包裹做 MD5。
function signJdParams(params) {
  const source = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}${value}`)
    .join('')
  return crypto.createHash('md5').update(`${secret}${source}${secret}`, 'utf8').digest('hex').toUpperCase()
}

// 京东要求 GMT+8 时间戳，格式 yyyy-MM-dd HH:mm:ss
function jdTimestamp() {
  return new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19)
}

function unwrapJdResponse(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('京东接口返回为空')

  // 网关级错误：{ "error_response": { "code": "1002", "zh_desc": "签名验证失败" } }
  if (payload.error_response) throwJdError(payload.error_response)

  const wrapperKey = Object.keys(payload).find(key => /^jd_union_open_.*_respon[cs]e$/.test(key))
  const wrapper = wrapperKey ? payload[wrapperKey] : payload
  if (!wrapper || typeof wrapper !== 'object') throw new Error('京东接口返回结构异常')

  // 旧版网关把错误码放在业务 wrapper 外层：{ "code": "1001", "zh_desc": "..." }
  if (wrapper.code !== undefined && String(wrapper.code) !== '0') throwJdError(wrapper)

  const resultKey = Object.keys(wrapper).find(key => /^(queryResult|getResult|result)$/i.test(key))
  if (!resultKey) throwJdError(wrapper, '京东接口未返回业务结果')

  let result = wrapper[resultKey]
  // 京东联盟网关有时把业务结果序列化成 JSON 字符串
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result)
    } catch {
      throw new Error('京东接口返回内容解析失败')
    }
  }
  if (!result || typeof result !== 'object') throw new Error('京东接口返回内容为空')

  const code = Number(result.code)
  if (Number.isFinite(code) && code !== 200) throwJdError(result)
  return result
}

function throwJdError(source, fallback) {
  const code = source?.code ?? source?.errorCode ?? source?.error_code
  const description = source?.zh_desc || source?.en_desc || source?.errorMessage || source?.errorMsg || source?.message || source?.msg
  const text = fallback || description || '京东接口调用失败'
  throw new Error(code !== undefined && String(code) !== '' ? `京东接口 ${code}：${text}` : text)
}

async function callJd(method, businessParams) {
  const params = {
    method,
    app_key: appKey,
    timestamp: jdTimestamp(),
    format: 'json',
    v: '1.0',
    sign_method: 'md5',
    '360buy_param_json': JSON.stringify(businessParams)
  }
  if (accessToken) params.access_token = accessToken
  params.sign = signJdParams(params)

  const body = new URLSearchParams(params)
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body
  })
  const text = await response.text()
  let payload
  try {
    payload = JSON.parse(text)
  } catch {
    throw new Error(`京东接口返回非 JSON（HTTP ${response.status}）：${text.slice(0, 160)}`)
  }
  if (!response.ok) {
    try {
      unwrapJdResponse(payload)
    } catch (error) {
      throw new Error(`京东接口 HTTP ${response.status}，${error.message}`)
    }
    throw new Error(`京东接口返回 HTTP ${response.status}`)
  }
  return { result: unwrapJdResponse(payload), payload }
}

function toArray(value, key) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (!key) return [value]
  const inner = value[key]
  if (Array.isArray(inner)) return inner
  if (inner && typeof inner === 'object') return [inner]
  return []
}

function normalizeUrl(url) {
  if (!url) return ''
  const text = String(url).trim()
  if (!text) return ''
  if (/^https?:\/\//i.test(text)) return text.replace(/^http:\/\//i, 'https://')
  return `https://${text.replace(/^\/\//, '')}`
}

function collectImages(product) {
  const imageList = product?.imageInfo?.imageList
  const holders = Array.isArray(imageList) ? imageList : [imageList]
  const urls = []
  for (const holder of holders) {
    if (!holder) continue
    if (typeof holder === 'string') {
      urls.push(holder)
      continue
    }
    const list = Array.isArray(holder) ? holder : toArray(holder.urlInfo)
    for (const item of list) {
      const url = typeof item === 'string' ? item : item?.url
      if (url) urls.push(url)
    }
  }
  const whiteImage = product?.imageInfo?.whiteImage
  return [...new Set([...urls, whiteImage].filter(Boolean).map(normalizeUrl))]
}

function collectCoupons(product) {
  const holders = [product?.couponInfo?.couponList, product?.purchasePriceInfo?.couponList]
  const coupons = []
  for (const holder of holders) {
    if (!holder) continue
    const raw = holder.coupon || holder.couponInfo || holder
    coupons.push(...(Array.isArray(raw) ? raw : [raw]))
  }
  return coupons.filter(item => item && typeof item === 'object')
}

// 把京东返回的商品对象整理成与淘宝一致的卡片字段。
function normalizeJdProduct(item, index) {
  const images = collectImages(item)
  const image = images[0] || ''
  if (!image) return null

  const originalPrice = Number(item?.priceInfo?.price || 0) || 0
  const promotionPrice = Number(item?.priceInfo?.lowestPrice || originalPrice) || originalPrice
  const finalPrice = Number(item?.priceInfo?.lowestCouponPrice || promotionPrice) || promotionPrice
  const coupon = collectCoupons(item).find(entry => Number(entry.discount) > 0)
  const couponAmount = Number(coupon?.discount || 0) || Math.max(0, promotionPrice - finalPrice)
  const owner = String(item?.owner || '').trim()
  const link = normalizeUrl(item?.materialUrl || item?.clickURL || (item?.skuId ? `item.jd.com/${item.skuId}.html` : ''))

  return {
    id: String(item?.skuId || item?.itemId || `jd-${index}`),
    title: item?.skuName || '京东精选好物',
    shop: item?.shopInfo?.shopName || '京东商家',
    image,
    images,
    originalPrice: Number(originalPrice.toFixed(2)),
    finalPrice: Number(finalPrice.toFixed(2)),
    coupon: Number(couponAmount.toFixed(2)),
    couponQuota: Number(coupon?.quota || 0) || 0,
    couponLink: normalizeUrl(coupon?.link),
    sold: Number(item?.inOrderCount30Days || 0) || 0,
    tag: couponAmount > 0 ? '京东优惠券' : (owner === 'g' ? '京东自营' : '京东精选'),
    link,
    source: 'jd'
  }
}

const productListKeys = ['jfGoodsResp', 'goodsResp', 'materialGoodsResp', 'rankGoodsResp']

// 京东不同物料接口的结果层级不完全一致：可能是数组、带 xxxResp 包装，或直接是单品对象。
function pickProductList(source) {
  if (!source) return []
  if (Array.isArray(source)) return source
  if (typeof source !== 'object') return []
  for (const key of productListKeys) {
    if (source[key] !== undefined) {
      const items = pickProductList(source[key])
      if (items.length) return items
    }
  }
  if (source.skuId || source.itemId || source.skuName) return [source]
  return []
}

function extractProductList(result) {
  const list = pickProductList(result?.data ?? result)
  return list.map(normalizeJdProduct).filter(product => product?.link && product?.image)
}

async function fetchJingfen({ categoryId, page, size }) {
  const client = await callJd('jd.union.open.goods.jingfen.query', {
    goodsReq: {
      eliteId: (jdCategories.find(item => item.id === categoryId) || jdCategories[0]).eliteId,
      pageIndex: page,
      pageSize: size,
      pid
    }
  })
  return client
}

// 京粉精选不可用时（如账号未开通/被限制），退回同为非权限的“猜你喜欢”物料接口。
// 注意该接口的频道 ID 与京粉精选不同，且 pageSize 最大 10、不支持传入调用者自己的 pid。
const materialChannels = { all: 1, recommend: 1, hot: 2, nine: 4 }

async function fetchMaterial({ categoryId, page, size }) {
  return callJd('jd.union.open.goods.material.query', {
    goodsReq: {
      eliteId: materialChannels[categoryId] || 1,
      pageIndex: page,
      pageSize: Math.min(size, 10)
    }
  })
}

export async function fetchJdProducts({ categoryId, page, size, query }) {
  let client
  let usedSize = size
  if (query) {
    client = await callJd('jd.union.open.goods.query', {
      goodsReqDTO: {
        keyword: query,
        pageIndex: page,
        pageSize: size,
        pid,
        sortName: 'inOrderCount30Days',
        sort: 'desc'
      }
    })
  } else {
    try {
      client = await fetchJingfen({ categoryId, page, size })
    } catch (error) {
      console.warn('[/api/jd/products] 京粉精选调用失败，尝试猜你喜欢物料：', error.message)
      client = await fetchMaterial({ categoryId, page, size })
      usedSize = Math.min(size, 10)
    }
  }

  const { result, payload } = client
  const products = extractProductList(result)
  if (!products.length) {
    console.warn('[/api/jd/products] 未解析到商品，原始返回：', JSON.stringify(payload).slice(0, 1200))
  }
  const totalCount = Number(result?.totalCount ?? result?.data?.totalCount ?? 0) || 0
  const hasMore = products.length >= usedSize && (totalCount ? page * usedSize < totalCount : true)
  const message = products.length ? '' : String(result?.message || '京东接口暂未返回商品，请切换分类重试')
  return { products, hasMore, totalCount, message }
}

export const jdConfig = { pid, siteId }

// 推广位 ID 是 pid 三段式的最后一段
const positionId = Number(pid.split('_').pop()) || undefined

// 京东主站商品链接转链需要 sceneId=2（需权限），联盟商品链接用 sceneId=1。
function resolveSceneId(materialUrl) {
  return /item\.(m\.)?jd\.com|3\.cn|\/product\//i.test(materialUrl) ? 2 : 1
}

// 生成京口令：command=1 时接口会额外返回 jCommand，未匹配到红包活动时只返回 clickURL。
export async function createJdCommand(materialUrl) {
  const { result } = await callJd('jd.union.open.promotion.common.get', {
    promotionCodeReq: {
      materialId: materialUrl,
      siteId,
      positionId,
      sceneId: resolveSceneId(materialUrl),
      command: 1
    }
  })
  const data = result?.data || {}
  const command = typeof data.jCommand === 'string' ? data.jCommand.trim() : ''
  const clickUrl = normalizeUrl(data.clickURL || '')
  return { command, clickUrl }
}
