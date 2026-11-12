<script setup>
import ProductCard from './ProductCard.vue'

defineProps({
  products: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  loaded: { type: Boolean, default: true },
  hasMore: { type: Boolean, default: false },
  platform: { type: Object, required: true },
  emptyHint: { type: String, default: '看看其他分类' }
})
const emit = defineEmits(['select', 'copy', 'open'])
</script>

<template>
  <div>
    <div v-if="(!loaded || loading) && !products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      <div v-for="i in 8" :key="i" class="overflow-hidden rounded-[8px] border border-line bg-white">
        <div class="aspect-square animate-pulse bg-[#eceef1]"></div>
        <div class="space-y-3 p-3">
          <div class="h-4 animate-pulse rounded bg-[#eceef1]"></div>
          <div class="h-4 w-2/3 animate-pulse rounded bg-[#eceef1]"></div>
          <div class="h-8 animate-pulse rounded bg-[#eceef1]"></div>
        </div>
      </div>
    </div>
    <div v-else-if="products.length" class="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :platform="platform"
        @select="emit('select', product)"
        @copy="emit('copy', product)"
        @open="emit('open', product)"
      />
    </div>
    <div v-else class="rounded-[8px] border border-dashed border-line bg-white px-5 py-16 text-center">
      <i class="ri-search-eye-line text-[42px] text-[#c4c8ce]"></i>
      <p class="mt-3 text-[14px] font-medium text-ink">没有找到相关优惠券</p>
      <p class="mt-1 text-[13px] text-muted">{{ emptyHint }}</p>
    </div>

    <div v-if="products.length && loading" class="mt-7 text-center text-[13px] text-muted">
      <i class="ri-loader-4-line mr-1 animate-spin text-[16px]"></i>正在加载更多
    </div>
    <div v-else-if="products.length && !hasMore" class="mt-8 flex items-center justify-center gap-2 text-[12px] text-muted">
      <span class="h-px w-12 bg-line"></span>已经到底啦<span class="h-px w-12 bg-line"></span>
    </div>
  </div>
</template>
