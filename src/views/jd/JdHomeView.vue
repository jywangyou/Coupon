<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import AppHeader from '../../components/AppHeader.vue'
import BackTopButton from '../../components/BackTopButton.vue'
import CategoryTabs from '../../components/CategoryTabs.vue'
import ProductDetailPopup from '../../components/ProductDetailPopup.vue'
import ProductGrid from '../../components/ProductGrid.vue'
import { useProductActions } from '../../composables/useProductActions'
import { useProductFeed } from '../../composables/useProductFeed'
import { fallbackCategories } from '../../constants/catalog'
import { platforms } from '../../constants/platforms'
import { fetchCategories } from '../../services/products'

const router = useRouter()
const platform = platforms.jd
const categories = ref(fallbackCategories.jd)
const scrollRef = ref(null)
const showBackTop = ref(false)
const selectedProduct = ref(null)
const showDetail = ref(false)

const {
  products, loading, loaded, hasMore, category, load, browseCategory
} = useProductFeed({
  platform,
  onError: message => showToast(message),
  onEmpty: message => showToast(message || '暂时没有找到相关京东优惠')
})
const { copyPrimary, openLink } = useProductActions(platform)

const themeStyle = computed(() => ({ '--brand': platform.accent, '--brand-deep': platform.accentDeep }))

onMounted(async () => {
  try {
    const list = await fetchCategories(platform)
    if (list.length) categories.value = list
  } catch {
    // 接口不可用时保留本地分类，保证页面仍可浏览
  }
  load()
})

function handleScroll(event) {
  const el = event.target
  showBackTop.value = el.scrollTop > 400
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 280) load()
}

function scrollToTop() {
  scrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

async function chooseCategory(next) {
  if (next.id === category.value) return
  const restored = await browseCategory(next.id)
  if (!restored) scrollRef.value?.scrollTo({ top: 0 })
}

function openSearch() {
  router.push({ name: 'search', query: { source: platform.id } })
}

function openDetail(product) {
  selectedProduct.value = product
  showDetail.value = true
}
</script>

<template>
  <div class="platform platform--jd flex min-h-0 flex-1 flex-col overflow-hidden" :style="themeStyle">
    <AppHeader :platform="platform" @search="openSearch" />

    <main class="relative flex flex-1 flex-col overflow-hidden">
      

      <div class="pt-3">
        <CategoryTabs :categories="categories" :active="category" @select="chooseCategory" />
      </div>

      <section ref="scrollRef" class="product-section content-width flex-1 pb-28 pt-6 sm:pb-14 sm:pt-8" @scroll="handleScroll">
        <ProductGrid
          :products="products"
          :loading="loading"
          :loaded="loaded"
          :has-more="hasMore"
          :platform="platform"
          :empty-hint="platform.emptyHint"
          @select="openDetail"
          @copy="copyPrimary"
          @open="openLink"
        />
      </section>

      <BackTopButton :show="showBackTop" @click="scrollToTop" />
    </main>

    <ProductDetailPopup v-model="showDetail" :product="selectedProduct" :platform="platform" />
  </div>
</template>
