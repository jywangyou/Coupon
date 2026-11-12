<script setup>
import { formatSold, money } from '../utils/format'

defineProps({
  product: { type: Object, required: true },
  platform: { type: Object, required: true }
})
const emit = defineEmits(['select', 'copy', 'open'])
</script>

<template>
  <article class="group relative overflow-hidden rounded-[8px] border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-[#dfe2e6] hover:shadow-soft">
    <button type="button" class="block w-full text-left" @click="emit('select', product)">
      <div class="relative aspect-square overflow-hidden bg-[#f2f3f5]">
        <img v-lazy="product.image" :alt="product.title" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        <span class="absolute bottom-2 left-2 rounded-[4px] bg-ink/85 px-2 py-1 text-[10px] font-medium text-white">{{ product.tag }}</span>
      </div>
      <div class="p-3 pb-2.5">
        <h3 class="line-clamp-2 min-h-[40px] text-[13px] font-medium leading-5 text-ink">{{ product.title }}</h3>
        <div class="mt-2 flex items-center gap-1 text-[11px] text-muted">
          <i class="ri-store-2-line"></i><span class="truncate">{{ product.shop }}</span>
        </div>
        <div class="mt-3 flex items-end justify-between gap-1">
          <div>
            <span class="text-[11px] text-muted">券后</span>
            <span class="brand-text ml-0.5 text-[20px] font-semibold leading-none">¥{{ money(product.finalPrice) }}</span>
          </div>
          <span class="shrink-0 text-[10px] text-muted">{{ platform.soldLabel }}{{ formatSold(product.sold) }}</span>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <span v-if="product.coupon > 0" class="brand-chip rounded-[3px] px-1.5 py-0.5 text-[10px] font-medium">券 ¥{{ money(product.coupon) }}</span>
          <span v-else class="rounded-[3px] bg-[#f5f6f8] px-1.5 py-0.5 text-[10px] font-medium text-muted">无券直降</span>
          <span class="text-[11px] text-muted line-through">¥{{ money(product.originalPrice) }}</span>
        </div>
      </div>
    </button>
    <div class="flex gap-2 px-3 pb-3">
      <button
        type="button"
        class="flex h-9 min-w-0 flex-1 items-center justify-center overflow-hidden whitespace-nowrap rounded-[6px] border border-line px-1 text-[11px] font-medium text-ink transition hover:border-ink sm:text-[12px]"
        @click="emit('copy', product)"
      >
        <i class="ri-file-copy-line mr-1 shrink-0 text-[15px]"></i><span class="truncate">{{ platform.copyLabel }}</span>
      </button>
      <button
        type="button"
        class="brand-bg grid h-9 w-10 shrink-0 place-items-center rounded-[6px] text-[17px] text-white transition"
        :title="platform.buyLabel"
        @click="emit('open', product)"
      ><i class="ri-external-link-line"></i></button>
    </div>
  </article>
</template>
