<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { closeToast, showLoadingToast, showToast, showImagePreview } from 'vant'
import logoUrl from './assets/logo.png'

const fallbackCategories = [
  { id: 'all', label: '精选', icon: 'ri-sparkling-2-line' },
  { id: 'food', label: '食品', icon: 'ri-cake-3-line' },
  { id: 'daily', label: '天天特卖', icon: 'ri-flashlight-line' },
  { id: 'women', label: '女装', icon: 'ri-shirt-line' },
  { id: 'men', label: '男装', icon: 'ri-windy-line' },
  { id: 'beauty', label: '美妆个护', icon: 'ri-magic-line' },
  { id: 'home', label: '家居家装', icon: 'ri-home-5-line' },
  { id: 'mother', label: '母婴', icon: 'ri-bear-smile-line' },
  { id: 'digital', label: '数码家电', icon: 'ri-computer-line' },
  { id: 'shoes', label: '鞋包配饰', icon: 'ri-briefcase-3-line' },
  { id: 'underwear', label: '内衣', icon: 'ri-user-heart-line' },
  { id: 'sport', label: '运动户外', icon: 'ri-bike-line' },
  { id: 'pet', label: '宠物', icon: 'ri-baidu-line' }
]

const categories = ref(fallbackCategories)
const products = ref([])
const query = ref('')
const searchDraft = ref('')
const showSearch = ref(false)
const isSearchView = ref(false)
const activeCategory = ref('all')
const page = ref(1)
const loading = ref(false)
const hasMore = ref(true)
const isMobile = ref(false)
const categoryCache = {}
const detailPosition = computed(() => isMobile.value ? 'right' : 'center')
const detailPopupStyle = computed(() => isMobile.value ? { width: 'min(90vw, 520px)', height: '100%' } : { width: 'min(560px, calc(100vw - 32px))', height: '88vh', borderRadius: '12px' })
const selectedProduct = ref(null)
const showDetail = ref(false)
const detailImageIndex = ref(0)
const searchModalInput = ref(null)
const scrollSentinel = ref(null)
const tabListRef = ref(null)
const swipeRef = ref(null)
const contentSectionRef = ref(null)
const showBackTop = ref(false)
let observer = null

const selectedCategoryLabel = computed(() => categories.value.find(item => item.id === activeCategory.value)?.label || '精选')

function money(value) {
  const number = Number(value || 0)
  return Number.isFinite(number) ? number.toFixed(2) : '0.00'
}

function formatSold(value) {
  const number = Number(value || 0)
  if (number >= 10000) return `${(number / 10000).toFixed(1)}万+`
  if (number >= 1000) return `${(number / 1000).toFixed(1)}k+`
  return `${number}+`
}

// 请求真实淘宝商品。reset 为 true 时会清空旧列表并从第一页重新加载。
async function requestProducts(reset = false, scrollToTop = false) {
  if (loading.value || (!hasMore.value && !reset)) return
  if (reset) {
    page.value = 1
    hasMore.value = true
    products.value = []
  }
  loading.value = true
  try {
    const params = new URLSearchParams({
      category: isSearchView.value ? '' : activeCategory.value,
      page: String(page.value),
      size: '12',
      q: isSearchView.value ? query.value.trim() : ''
    })
    const response = await fetch(`/api/products?${params}`)
    if (!response.ok) throw new Error('商品请求失败')
    const data = await response.json()
    products.value = reset ? data.products : [...products.value, ...data.products]
    hasMore.value = Boolean(data.hasMore)
    if (!data.products.length && reset) showToast('暂时没有找到相关优惠券')
    page.value += 1
    // 缓存当前 tab 的数据
    if (!isSearchView.value) {
      categoryCache[activeCategory.value] = {
        products: [...products.value],
        page: page.value,
        hasMore: hasMore.value
      }
    }
  } catch {
    if (reset) showToast('网络开小差了，请稍后再试')
  } finally {
    loading.value = false
  }
  if (scrollToTop) {
    await nextTick()
    const el = contentSectionRef.value
    if (el) el.scrollTop = 0
  }
}

async function chooseCategory(category) {
  if (activeCategory.value === category.id) return
  activeCategory.value = category.id
  isSearchView.value = false
  query.value = ''
  searchDraft.value = ''
  // 缓存命中则直接恢复，不请求，保持当前滚动位置
  const cached = categoryCache[category.id]
  if (cached && cached.products.length > 0) {
    products.value = cached.products
    page.value = cached.page
    hasMore.value = cached.hasMore
    loading.value = false
    return
  }
  // 目标 tab 无缓存 → 请求并滚动到 section 顶部
  await requestProducts(true, true)
}

function openSearch() {
  searchDraft.value = query.value
  showSearch.value = true
  nextTick(() => searchModalInput.value?.focus?.())
}

function submitSearch() {
  const keyword = searchDraft.value.trim()
  if (!keyword) return
  query.value = keyword
  isSearchView.value = true
  showSearch.value = false
  showBackTop.value = false
  requestProducts(true)
}

function closeSearchView() {
  isSearchView.value = false
  query.value = ''
  searchDraft.value = ''
  activeCategory.value = 'all'
  const cached = categoryCache['all']
  if (cached && cached.products.length > 0) {
    products.value = cached.products
    page.value = cached.page
    hasMore.value = cached.hasMore
    loading.value = false
  } else {
    requestProducts(true, true)
  }
}

// 点击卡片后交给 Vant Popup：PC 居中，移动端从右侧滑入。
function openDetail(product) {
  selectedProduct.value = product
  detailImageIndex.value = 0
  showDetail.value = true
  nextTick(() => {
    document.querySelector('.detail-body')?.scrollTo(0, 0)
  })
}

const detailImages = computed(() => {
  if (!selectedProduct.value) return []
  const imgs = selectedProduct.value.images
  return (Array.isArray(imgs) && imgs.length > 1) ? imgs : [selectedProduct.value.image]
})

const previewImagesList = computed(() => detailImages.value)

function openImagePreview() {
  if (!previewImagesList.value.length) return
  return showImagePreview({
    images: previewImagesList.value,
    startPosition: detailImageIndex.value,
    closeable: true,
    closeOnPopstate: false
  })
}

function swipePrev() {
  swipeRef.value?.prev()
}

function swipeNext() {
  swipeRef.value?.next()
}

function handleTabWheel(e) {
  e.preventDefault()
  const el = tabListRef.value
  if (!el) return
  const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
  el.scrollBy({ left: delta, behavior: 'smooth' })
}

function updateViewport() {
  isMobile.value = window.matchMedia('(max-width: 639px)').matches
}

const searchScrollRef = ref(null)

function getScrollEl() {
  return isSearchView.value ? searchScrollRef.value : contentSectionRef.value
}

function handleSectionScroll() {
  const el = getScrollEl()
  showBackTop.value = el && el.scrollTop > 400
}

function scrollToTopSection() {
  const el = getScrollEl()
  if (el) el.scrollTo({ top: 0, behavior: 'smooth' })
}

function openCoupon(product = selectedProduct.value) {
  if (!product?.link) return showToast('暂时没有可用的优惠券链接')
  window.open(product.link, '_blank', 'noopener,noreferrer')
}

async function copyText(text) {
  if (!text) return false
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  }
}

async function copyTaokouling(product = selectedProduct.value) {
  if (!product?.link) return showToast('暂时没有可复制的商品链接')
  showLoadingToast({ message: '正在生成淘口令…', forbidClick: true, duration: 0 })
  try {
    const response = await fetch('/api/tpwd', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ url: product.link, text: product.title })
    })
    const data = await response.json()
    const copied = await copyText(data.password)
    closeToast()
    showToast(copied ? '淘口令已复制，打开淘宝即可查看' : '复制失败，请手动复制')
  } catch {
    closeToast()
    const copied = await copyText(product.link)
    showToast(copied ? '接口暂不可用，已复制商品链接' : '复制失败，请稍后再试')
  }
}

async function loadCategories() {
  try {
    const response = await fetch('/api/categories')
    if (!response.ok) return
    const data = await response.json()
    if (Array.isArray(data.categories) && data.categories.length) categories.value = data.categories
  } catch {
    // 接口不可用时保留本地分类，保证页面仍可浏览
  }
}

function createObserver(root) {
  return new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && !loading.value && hasMore.value) {
      requestProducts()
    }
  }, { root, rootMargin: '200px' })
}

onMounted(async () => {
  await loadCategories()
  updateViewport()
  window.addEventListener('resize', updateViewport)
  requestProducts(true)

  observer = createObserver(null)
  nextTick(() => {
    if (scrollSentinel.value) observer.observe(scrollSentinel.value)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
  if (observer) observer.disconnect()
})

watch(scrollSentinel, (el, old) => {
  if (old && observer) observer.unobserve(old)
  if (el) {
    // 根据当前视图重建 observer
    if (observer) observer.disconnect()
    const root = !isSearchView.value ? contentSectionRef.value : searchScrollRef.value
    observer = createObserver(root)
    observer.observe(el)
  }
})

watch(isSearchView, () => {
  showBackTop.value = false
})
</script>

<template>
  <div class="app-shell">
    <header v-if="!isSearchView" class="sticky top-0 z-30 border-b border-line bg-[#f7f8fa]/95 backdrop-blur">
      <div class="content-width relative flex h-[68px] items-center justify-between">
        <a class="flex shrink-0 items-center gap-2 text-ink no-underline" href="#top" aria-label="省心券首页">
          <img :src="logoUrl" alt="省心券" class="h-9 w-9 rounded-[9px] object-contain shadow-sm" />
        </a>
        <h1 class="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold tracking-[-.02em] text-ink">省心券</h1>
        <button type="button" class="grid h-10 w-10 place-items-center rounded-[8px] text-[22px] text-ink transition hover:bg-white hover:text-brand" title="搜索优惠券" @click="openSearch"><i class="ri-search-line"></i></button>
      </div>
    </header>

    <!-- 搜索独立页面 -->
    <template v-if="isSearchView">
      <div class="relative flex flex-1 flex-col overflow-hidden">
        <!-- 搜索页 header：固定，不随商品列表滚动 -->
        <section class="shrink-0 border-b border-line bg-[#f7f8fa]/95 backdrop-blur z-20">
          <div class="content-width flex h-[68px] items-center gap-3">
            <button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] text-[22px] text-ink transition hover:bg-white" title="返回" @click="closeSearchView"><i class="ri-arrow-left-line"></i></button>
            <img :src="logoUrl" alt="省心券" class="h-8 w-8 rounded-[8px] object-contain" />
            <h1 class="text-[18px] font-semibold tracking-[-.02em] text-ink">省心券</h1>
          </div>
        </section>
        <!-- 可滚动区域：搜索输入 + 商品列表 -->
        <section ref="searchScrollRef" class="content-width flex-1 overflow-y-auto" @scroll="handleSectionScroll">
          <div class="pt-5">
            <div class="relative flex items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-3">
              <i class="ri-search-line shrink-0 text-[20px] text-muted"></i>
              <input
                v-model="query"
                @keyup.enter="requestProducts(true)"
                class="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#a4a8ae]"
                :placeholder="`搜索：${query || '输入商品名称'}`"
                @focus="$event.target.select()"
              />
            </div>
          </div>
          <div class="pb-28 pt-5 sm:pb-14">
            <div v-if="loading && !products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              <div v-for="i in 8" :key="i" class="overflow-hidden rounded-[8px] border border-line bg-white"><div class="aspect-square animate-pulse bg-[#eceef1]"></div><div class="space-y-3 p-3"><div class="h-4 animate-pulse rounded bg-[#eceef1]"></div><div class="h-4 w-2/3 animate-pulse rounded bg-[#eceef1]"></div><div class="h-8 animate-pulse rounded bg-[#eceef1]"></div></div></div>
            </div>
            <div v-else-if="products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              <article v-for="product in products" :key="product.id" class="group relative overflow-hidden rounded-[8px] border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#dfe2e6] hover:shadow-soft">
                <button type="button" class="block w-full text-left" @click="openDetail(product)">
                  <div class="relative aspect-square overflow-hidden bg-[#f2f3f5]"><img v-lazy="product.image" :alt="product.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span class="absolute bottom-2 left-2 rounded-[4px] bg-ink/85 px-2 py-1 text-[10px] font-medium text-white">{{ product.tag }}</span></div>
                  <div class="p-3 pb-2.5">
                    <h3 class="line-clamp-2 min-h-[40px] text-[13px] font-medium leading-5 text-ink">{{ product.title }}</h3>
                    <div class="mt-2 flex items-center gap-1 text-[11px] text-muted"><i class="ri-store-2-line"></i><span class="truncate">{{ product.shop }}</span></div>
                    <div class="mt-3 flex items-end justify-between gap-1"><div><span class="text-[11px] text-muted">券后</span><span class="ml-0.5 text-[20px] font-semibold leading-none text-brand">¥{{ money(product.finalPrice) }}</span></div><span class="shrink-0 text-[10px] text-muted">已售{{ formatSold(product.sold) }}</span></div>
                    <div class="mt-2 flex items-center gap-2"><span class="rounded-[3px] border border-dashed border-brand/50 bg-[#fff5f5] px-1.5 py-0.5 text-[10px] font-medium text-brand">券 ¥{{ money(product.coupon) }}</span><span class="text-[11px] text-muted line-through">¥{{ money(product.originalPrice) }}</span></div>
                  </div>
                </button>
                <div class="flex gap-2 px-3 pb-3"><button type="button" class="flex h-9 min-w-0 flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-[6px] border border-line px-1 text-[11px] font-medium text-ink transition hover:border-ink sm:text-[12px]" @click="copyTaokouling(product)"><i class="ri-file-copy-line mr-1 shrink-0 text-[15px]"></i><span class="truncate">复制淘口令</span></button><button type="button" class="grid h-9 w-10 shrink-0 place-items-center rounded-[6px] bg-brand text-[17px] text-white transition hover:bg-brandDeep" title="打开优惠券页面" @click="openCoupon(product)"><i class="ri-external-link-line"></i></button></div>
              </article>
            </div>
            <div v-else class="rounded-[8px] border border-dashed border-line bg-white px-5 py-16 text-center"><i class="ri-search-eye-line text-[42px] text-[#c4c8ce]"></i><p class="mt-3 text-[14px] font-medium text-ink">没有找到相关优惠券</p><p class="mt-1 text-[13px] text-muted">换个关键词试试</p></div>
            <div v-if="products.length && loading" class="mt-7 text-center text-[13px] text-muted"><i class="ri-loader-4-line animate-spin mr-1 text-[16px]"></i>正在加载更多</div>
            <div v-else-if="products.length && !hasMore" class="mt-8 flex items-center justify-center gap-2 text-[12px] text-muted"><span class="h-px w-12 bg-line"></span>已经到底啦<span class="h-px w-12 bg-line"></span></div>
            <div ref="scrollSentinel" class="h-px"></div>
          </div>
        </section>
        <button v-if="showBackTop" type="button" class="absolute bottom-6 right-6 z-10 grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-[18px] text-ink shadow-soft transition hover:bg-[#f5f6f8]" @click="scrollToTopSection"><i class="ri-arrow-up-line"></i></button>
      </div>
    </template>

    <!-- 首页（分类 tabs） -->
    <template v-else>
      <main id="top" class="flex flex-1 flex-col overflow-hidden">
        <section class="shrink-0 border-b border-line bg-[#f7f8fa]/95 py-3 backdrop-blur z-20">
          <div class="content-width">
            <div ref="tabListRef" class="no-scrollbar flex gap-2 overflow-x-auto" @wheel.prevent="handleTabWheel">
              <button v-for="category in categories" :key="category.id" type="button" class="flex h-10 shrink-0 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-medium transition" :class="activeCategory === category.id ? 'border-ink bg-ink text-white shadow-sm' : 'border-line bg-white text-muted hover:border-[#cfd3d8] hover:text-ink'" @click="chooseCategory(category)">
                <i v-if="category.icon && !category.icon.startsWith('ri-')" :class="'text-[16px]'" v-html="category.icon"></i>
                <i v-else :class="category.icon || 'ri-price-tag-3-line'" class="text-[16px]"></i>{{ category.label }}
              </button>
            </div>
          </div>
        </section>

        <section ref="contentSectionRef" class="product-section content-width flex-1 pb-28 pt-7 sm:pb-14 sm:pt-9 relative" @scroll="handleSectionScroll">

          <div v-if="loading && !products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            <div v-for="i in 8" :key="i" class="overflow-hidden rounded-[8px] border border-line bg-white"><div class="aspect-square animate-pulse bg-[#eceef1]"></div><div class="space-y-3 p-3"><div class="h-4 animate-pulse rounded bg-[#eceef1]"></div><div class="h-4 w-2/3 animate-pulse rounded bg-[#eceef1]"></div><div class="h-8 animate-pulse rounded bg-[#eceef1]"></div></div></div>
          </div>
          <div v-else-if="products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
            <article v-for="product in products" :key="product.id" class="group relative overflow-hidden rounded-[8px] border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#dfe2e6] hover:shadow-soft">
              <button type="button" class="block w-full text-left" @click="openDetail(product)">
                <div class="relative aspect-square overflow-hidden bg-[#f2f3f5]"><img v-lazy="product.image" :alt="product.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" /><span class="absolute bottom-2 left-2 rounded-[4px] bg-ink/85 px-2 py-1 text-[10px] font-medium text-white">{{ product.tag }}</span></div>
                <div class="p-3 pb-2.5">
                  <h3 class="line-clamp-2 min-h-[40px] text-[13px] font-medium leading-5 text-ink">{{ product.title }}</h3>
                  <div class="mt-2 flex items-center gap-1 text-[11px] text-muted"><i class="ri-store-2-line"></i><span class="truncate">{{ product.shop }}</span></div>
                  <div class="mt-3 flex items-end justify-between gap-1"><div><span class="text-[11px] text-muted">券后</span><span class="ml-0.5 text-[20px] font-semibold leading-none text-brand">¥{{ money(product.finalPrice) }}</span></div><span class="shrink-0 text-[10px] text-muted">已售{{ formatSold(product.sold) }}</span></div>
                  <div class="mt-2 flex items-center gap-2"><span class="rounded-[3px] border border-dashed border-brand/50 bg-[#fff5f5] px-1.5 py-0.5 text-[10px] font-medium text-brand">券 ¥{{ money(product.coupon) }}</span><span class="text-[11px] text-muted line-through">¥{{ money(product.originalPrice) }}</span></div>
                </div>
              </button>
              <div class="flex gap-2 px-3 pb-3"><button type="button" class="flex h-9 min-w-0 flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-[6px] border border-line px-1 text-[11px] font-medium text-ink transition hover:border-ink sm:text-[12px]" @click="copyTaokouling(product)"><i class="ri-file-copy-line mr-1 shrink-0 text-[15px]"></i><span class="truncate">复制淘口令</span></button><button type="button" class="grid h-9 w-10 shrink-0 place-items-center rounded-[6px] bg-brand text-[17px] text-white transition hover:bg-brandDeep" title="打开优惠券页面" @click="openCoupon(product)"><i class="ri-external-link-line"></i></button></div>
            </article>
          </div>
          <div v-else class="rounded-[8px] border border-dashed border-line bg-white px-5 py-16 text-center"><i class="ri-search-eye-line text-[42px] text-[#c4c8ce]"></i><p class="mt-3 text-[14px] font-medium text-ink">没有找到相关优惠券</p><p class="mt-1 text-[13px] text-muted">看看其他分类</p></div>

          <div v-if="products.length && loading" class="mt-7 text-center text-[13px] text-muted"><i class="ri-loader-4-line animate-spin mr-1 text-[16px]"></i>正在加载更多</div>
          <div v-else-if="products.length && !hasMore" class="mt-8 flex items-center justify-center gap-2 text-[12px] text-muted"><span class="h-px w-12 bg-line"></span>已经到底啦<span class="h-px w-12 bg-line"></span></div>
          <div ref="scrollSentinel" class="h-px"></div>
        </section>
        <button v-if="showBackTop" type="button" class="absolute bottom-6 right-6 z-10 grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-[18px] text-ink shadow-soft transition hover:bg-[#f5f6f8]" @click="scrollToTopSection"><i class="ri-arrow-up-line"></i></button>
      </main>
    </template>

    <van-popup v-model:show="showSearch" position="right" :style="{ width: 'min(100vw, 560px)', height: '100%' }">
      <div class="flex h-full flex-col bg-[#f7f8fa]">
        <div class="flex h-[68px] items-center gap-3 border-b border-line bg-white px-5">
          <button type="button" class="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[21px] text-muted hover:bg-[#f1f2f4]" title="关闭搜索" @click="showSearch = false"><i class="ri-arrow-left-line"></i></button>
          <h2 class="text-[18px] font-semibold text-ink">搜索优惠券</h2>
        </div>
        <div class="px-5 pt-6">
          <div class="relative flex">
            <i class="ri-search-line pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[19px] text-muted"></i>
            <input ref="searchModalInput" v-model="searchDraft" @keyup.enter="submitSearch" class="h-12 w-full rounded-[8px] border border-line bg-white pl-11 pr-24 text-[14px] outline-none transition placeholder:text-[#a4a8ae] focus:border-brand focus:ring-2 focus:ring-brand/10" placeholder="输入商品名称，例如：面霜" />
            <button v-if="searchDraft" type="button" class="absolute right-[72px] top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-[#f1f2f4]" title="清除搜索" @click="searchDraft = ''"><i class="ri-close-line text-[17px]"></i></button>
            <button type="button" class="absolute right-1 top-1 h-10 rounded-[7px] bg-ink px-4 text-[13px] font-medium text-white" @click="submitSearch">搜索</button>
          </div>
          <p class="mt-3 text-[13px] leading-5 text-muted">搜索结果来自淘宝客实时商品库，优惠券和价格以淘宝页面为准。</p>
        </div>
        <div class="mt-8 px-5">
          <div class="text-[13px] font-medium text-ink">热门搜索</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button v-for="term in ['面霜', '手机', '零食', '收纳', '运动鞋', '护手霜']" :key="term" type="button" class="rounded-full border border-line bg-white px-3 py-2 text-[12px] text-muted transition hover:border-brand hover:text-brand" @click="searchDraft = term">{{ term }}</button>
          </div>
        </div>
      </div>
    </van-popup>

    <van-popup v-model:show="showDetail" :position="detailPosition" :style="detailPopupStyle">
      <template v-if="selectedProduct">
        <div class="detail-header">
          <button type="button" class="grid h-9 w-9 place-items-center rounded-full text-[20px] text-ink hover:bg-[#f1f2f4]" title="关闭" @click="showDetail = false"><i class="ri-close-line"></i></button>
          <h2 class="ml-2 text-[15px] font-semibold text-ink">商品详情</h2>
        </div>
        <div class="detail-body">
          <div class="relative overflow-hidden rounded-[8px] bg-[#f2f3f5]">
            <div class="group relative cursor-pointer" @click="openImagePreview()">
              <van-swipe
                v-if="detailImages.length > 1"
                ref="swipeRef"
                :autoplay="0"
                :loop="true"
                indicator-color="transparent"
                style="height: 100%"
                @change="idx => detailImageIndex = idx"
              >
                <van-swipe-item v-for="(img, i) in detailImages" :key="i">
                  <img :src="img" :alt="`${selectedProduct.title} - ${i + 1}`" class="aspect-[1.15] h-full w-full object-cover" />
                </van-swipe-item>
              </van-swipe>
              <img v-else :src="selectedProduct.image" :alt="selectedProduct.title" class="aspect-[1.15] w-full" />
              <!-- PC端鼠标悬停时显示左右指示器 -->
              <template v-if="detailImages.length > 1">
                <button
                  type="button"
                  class="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-[18px] text-white opacity-0 transition group-hover:opacity-100 sm:grid"
                  :class="detailImageIndex === 0 ? 'pointer-events-none opacity-0' : ''"
                  title="上一张"
                  @click.stop="swipePrev()"
                ><i class="ri-arrow-left-s-line"></i></button>
                <button
                  type="button"
                  class="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/30 text-[18px] text-white opacity-0 transition group-hover:opacity-100 sm:grid"
                  :class="detailImageIndex >= detailImages.length - 1 ? 'pointer-events-none opacity-0' : ''"
                  title="下一张"
                  @click.stop="swipeNext()"
                ><i class="ri-arrow-right-s-line"></i></button>
              </template>
            </div>
            <div class="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1">
              <i class="ri-zoom-in-line text-[13px] text-white/90 drop-shadow" aria-hidden="true"></i>
              <span v-if="detailImages.length > 1" class="rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">{{ detailImageIndex + 1 }}/{{ detailImages.length }}</span>
            </div>
          </div>
          <div class="mt-5"><div><span class="rounded-[4px] bg-[#fff2f2] px-2 py-1 text-[11px] font-medium text-brand">{{ selectedProduct.tag }}</span><h2 class="mt-3 text-[19px] font-semibold leading-7 text-ink">{{ selectedProduct.title }}</h2><div class="mt-2 flex items-center gap-1 text-[12px] text-muted"><i class="ri-store-2-line"></i>{{ selectedProduct.shop }}<span class="mx-1 text-[#d5d8dc]">·</span>已售{{ formatSold(selectedProduct.sold) }}</div></div></div>
          <div class="mt-6 flex items-end gap-3"><div><div class="text-[12px] text-muted">券后价</div><div class="mt-1 text-[32px] font-semibold leading-none text-brand">¥{{ money(selectedProduct.finalPrice) }}</div></div><span class="mb-1 text-[13px] text-muted line-through">¥{{ money(selectedProduct.originalPrice) }}</span><span class="mb-1 rounded-[4px] bg-[#fff2f2] px-2 py-1 text-[12px] font-medium text-brand">省 ¥{{ money(selectedProduct.coupon) }}</span></div>
          <div class="mt-6 rounded-[8px] border border-dashed border-[#f5b7b7] bg-[#fff9f9] p-4"><div class="flex items-center gap-2 text-[13px] font-medium text-brand"><i class="ri-coupon-3-line text-[18px]"></i>专享优惠券</div><p class="mt-2 text-[12px] leading-5 text-muted">先领券再下单，优惠以淘宝页面实时展示为准。你可以复制淘口令，也可以直接打开领券页面。</p></div>
          <div class="mt-6 grid grid-cols-2 gap-3"><button type="button" class="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-line text-[13px] font-medium text-ink transition hover:border-ink" @click="copyTaokouling()"><i class="ri-file-copy-line text-[18px]"></i>复制淘口令</button><button type="button" class="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] bg-brand text-[13px] font-medium text-white transition hover:bg-brandDeep" @click="openCoupon()"><i class="ri-external-link-line text-[18px]"></i>打开优惠券页面</button></div>
        </div>
      </template>
    </van-popup>
  </div>
</template>
