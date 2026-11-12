<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import BackTopButton from '../../components/BackTopButton.vue'
import ProductDetailPopup from '../../components/ProductDetailPopup.vue'
import ProductGrid from '../../components/ProductGrid.vue'
import { useProductActions } from '../../composables/useProductActions'
import { useProductFeed } from '../../composables/useProductFeed'
import { platforms } from '../../constants/platforms'

const route = useRoute()
const router = useRouter()
const source = computed(() => (route.query.source === 'jd' ? 'jd' : 'taobao'))
const platform = computed(() => platforms[source.value])
const themeStyle = computed(() => ({ '--brand': platform.value.accent, '--brand-deep': platform.value.accentDeep }))

const draft = ref('')
const scrollRef = ref(null)
const showBackTop = ref(false)
const selectedProduct = ref(null)
const showDetail = ref(false)

const {
  products, loading, loaded, hasMore, keyword, load, search
} = useProductFeed({
  platform: () => platform.value,
  onError: message => showToast(message),
  onEmpty: message => showToast(message || '暂时没有找到相关优惠券')
})
const { copyPrimary, openLink } = useProductActions(() => platform.value)

watch(() => route.query.q, (value) => {
  const text = String(value || '').trim()
  draft.value = text
  if (text) search(text)
}, { immediate: true })

function submit() {
  const text = draft.value.trim()
  if (!text) return showToast('请输入搜索关键词')
  if (text === String(route.query.q || '')) {
    search(text)
    return
  }
  router.replace({ name: 'search', query: { source: source.value, q: text } })
}

function pickHot(term) {
  draft.value = term
  submit()
}

function goBack() {
  router.push({ name: source.value })
}

function handleScroll(event) {
  const el = event.target
  showBackTop.value = el.scrollTop > 400
  if (el.scrollHeight - el.scrollTop - el.clientHeight < 280) load()
}

function scrollToTop() {
  scrollRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function openDetail(product) {
  selectedProduct.value = product
  showDetail.value = true
}
</script>

<template>
  <div class="platform flex min-h-0 flex-1 flex-col overflow-hidden" :style="themeStyle">
    <section class="z-20 shrink-0 border-b border-line bg-[#f7f8fa]/95 backdrop-blur">
      <div class="content-width flex h-[68px] items-center gap-3">
        <button type="button" class="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] text-[22px] text-ink transition hover:bg-white" title="返回" @click="goBack">
          <i class="ri-arrow-left-line"></i>
        </button>
        <img :src="platform.icon" :alt="platform.name" class="h-8 w-8 rounded-[8px] object-contain" />
        <h1 class="text-[18px] font-semibold tracking-[-.02em] text-ink">{{ platform.title }}</h1>
        <span class="ml-auto text-[11px] text-muted">{{ platform.name }}优惠搜索</span>
      </div>
    </section>

    <div class="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <section ref="scrollRef" class="content-width flex-1 overflow-y-auto" @scroll="handleScroll">
        <div class="pt-5">
          <div class="relative flex items-center gap-2 rounded-[8px] border border-line bg-white px-4 py-2.5">
            <i class="ri-search-line shrink-0 text-[20px] text-muted"></i>
            <input
              v-model="draft"
              class="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-[#a4a8ae]"
              :placeholder="platform.searchPlaceholder"
              @keyup.enter="submit"
              @focus="$event.target.select()"
            />
            <button type="button" class="brand-bg shrink-0 rounded-[6px] px-3 py-1.5 text-[12px] font-medium text-white" @click="submit">搜索</button>
          </div>
          <p class="mt-3 text-[12px] leading-5 text-muted">{{ platform.searchNote }}</p>
        </div>

        <div v-if="!keyword && !products.length && !loading" class="mt-6">
          <div class="text-[13px] font-medium text-ink">热门搜索</div>
          <div class="mt-3 flex flex-wrap gap-2">
            <button
              v-for="term in platform.hotKeywords"
              :key="term"
              type="button"
              class="rounded-full border border-line bg-white px-3 py-2 text-[12px] text-muted transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              @click="pickHot(term)"
            >{{ term }}</button>
          </div>
        </div>

        <div v-if="keyword || products.length || loading" class="pb-28 pt-5 sm:pb-14">
          <ProductGrid
            :products="products"
            :loading="loading"
            :loaded="loaded"
            :has-more="hasMore"
            :platform="platform"
            empty-hint="换个关键词试试"
            @select="openDetail"
            @copy="copyPrimary"
            @open="openLink"
          />
        </div>
      </section>

      <BackTopButton :show="showBackTop" @click="scrollToTop" />
    </div>

    <ProductDetailPopup v-model="showDetail" :product="selectedProduct" :platform="platform" />
  </div>
</template>
