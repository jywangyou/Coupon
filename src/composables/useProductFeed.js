import { ref } from 'vue'
import { fetchProducts } from '../services/products'

// 商品流：分类浏览、关键词搜索、分页加载与分类缓存共用一套逻辑。
export function useProductFeed({ platform, pageSize = 12, onError, onEmpty }) {
  const resolvePlatform = typeof platform === 'function' ? platform : () => platform

  const products = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)
  const loaded = ref(false)
  const category = ref('all')
  const keyword = ref('')
  const categoryCache = new Map()

  function cacheCurrentCategory() {
    if (keyword.value) return
    categoryCache.set(category.value, {
      products: [...products.value],
      page: page.value,
      hasMore: hasMore.value
    })
  }

  async function load({ reset = false } = {}) {
    if (loading.value) return null
    if (!reset && !hasMore.value) return null
    if (reset) {
      page.value = 1
      hasMore.value = true
      products.value = []
    }
    loading.value = true
    try {
      const data = await fetchProducts(resolvePlatform(), {
        category: category.value,
        page: page.value,
        size: pageSize,
        q: keyword.value
      })
      products.value = reset ? data.products : [...products.value, ...data.products]
      hasMore.value = data.hasMore
      page.value += 1
      cacheCurrentCategory()
      if (reset && !products.value.length) onEmpty?.(data.message)
      return data
    } catch {
      hasMore.value = false
      if (reset) onError?.('网络开小差了，请稍后再试')
      return null
    } finally {
      loading.value = false
      loaded.value = true
    }
  }

  // 返回 true 表示命中缓存，页面可以保持当前滚动位置。
  async function browseCategory(id) {
    if (category.value === id && !keyword.value) return true
    category.value = id
    keyword.value = ''
    const cached = categoryCache.get(id)
    if (cached?.products.length) {
      products.value = cached.products
      page.value = cached.page
      hasMore.value = cached.hasMore
      loading.value = false
      return true
    }
    await load({ reset: true })
    return false
  }

  async function search(term) {
    const text = String(term || '').trim()
    if (!text) return
    keyword.value = text
    category.value = 'all'
    await load({ reset: true })
  }

  return { products, loading, loaded, hasMore, category, keyword, load, browseCategory, search }
}
