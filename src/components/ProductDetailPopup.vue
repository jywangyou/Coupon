<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { showImagePreview } from 'vant'
import { formatSold, money } from '../utils/format'
import { useProductActions } from '../composables/useProductActions'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  platform: { type: Object, required: true }
})
const emit = defineEmits(['update:modelValue'])

const { copyPrimary, openLink } = useProductActions(props.platform)

const isMobile = ref(false)
const detailImageIndex = ref(0)
const swipeRef = ref(null)

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const position = computed(() => (isMobile.value ? 'right' : 'center'))
const popupStyle = computed(() => (isMobile.value
  ? { width: 'min(90vw, 520px)', height: '100%' }
  : { width: 'min(560px, calc(100vw - 32px))', height: '88vh', borderRadius: '12px' }))

const images = computed(() => {
  if (!props.product) return []
  const list = props.product.images
  if (Array.isArray(list) && list.length) return list
  return [props.product.image].filter(Boolean)
})

function updateViewport() {
  isMobile.value = window.matchMedia('(max-width: 639px)').matches
}

onMounted(() => {
  updateViewport()
  window.addEventListener('resize', updateViewport)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateViewport)
})

watch(() => props.product, () => {
  detailImageIndex.value = 0
})

watch(() => props.modelValue, (value) => {
  if (!value) return
  nextTick(() => document.querySelector('.detail-body')?.scrollTo(0, 0))
})

function openImagePreview() {
  if (!images.value.length) return
  showImagePreview({
    images: images.value,
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
</script>

<template>
  <van-popup v-model:show="show" :position="position" :style="popupStyle">
    <template v-if="product">
      <div class="detail-header">
        <button type="button" class="grid h-9 w-9 place-items-center rounded-full text-[20px] text-ink hover:bg-[#f1f2f4]" title="关闭" @click="show = false"><i class="ri-close-line"></i></button>
        <h2 class="ml-2 text-[15px] font-semibold text-ink">商品详情</h2>
        <span class="ml-auto flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-medium text-muted">
          <img :src="platform.icon" :alt="platform.name" class="h-3.5 w-3.5 rounded-[3px] object-contain" />{{ platform.name }}
        </span>
      </div>
      <div class="detail-body">
        <div class="relative overflow-hidden rounded-[8px] bg-[#f2f3f5]">
          <div class="group relative cursor-pointer" @click="openImagePreview()">
            <van-swipe
              v-if="images.length > 1"
              ref="swipeRef"
              :autoplay="0"
              :loop="true"
              indicator-color="transparent"
              style="height: 100%"
              @change="idx => detailImageIndex = idx"
            >
              <van-swipe-item v-for="(img, i) in images" :key="i">
                <img :src="img" :alt="`${product.title} - ${i + 1}`" class="aspect-[1.15] h-full w-full object-cover" />
              </van-swipe-item>
            </van-swipe>
            <img v-else :src="product.image" :alt="product.title" class="aspect-[1.15] w-full object-cover" />
            <template v-if="images.length > 1">
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
                :class="detailImageIndex >= images.length - 1 ? 'pointer-events-none opacity-0' : ''"
                title="下一张"
                @click.stop="swipeNext()"
              ><i class="ri-arrow-right-s-line"></i></button>
            </template>
          </div>
          <div class="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1">
            <i class="ri-zoom-in-line text-[13px] text-white/90 drop-shadow" aria-hidden="true"></i>
            <span v-if="images.length > 1" class="rounded-full bg-black/55 px-2 py-0.5 text-[11px] text-white">{{ detailImageIndex + 1 }}/{{ images.length }}</span>
          </div>
        </div>

        <div class="mt-5">
          <div>
            <span class="brand-chip rounded-[4px] px-2 py-1 text-[11px] font-medium">{{ product.tag }}</span>
            <h2 class="mt-3 text-[19px] font-semibold leading-7 text-ink">{{ product.title }}</h2>
            <div class="mt-2 flex items-center gap-1 text-[12px] text-muted">
              <i class="ri-store-2-line"></i>{{ product.shop }}
              <span class="mx-1 text-[#d5d8dc]">·</span>{{ platform.soldLabel }}{{ formatSold(product.sold) }}
            </div>
          </div>
        </div>

        <div class="mt-6 flex items-end gap-3">
          <div>
            <div class="text-[12px] text-muted">券后价</div>
            <div class="brand-text mt-1 text-[32px] font-semibold leading-none">¥{{ money(product.finalPrice) }}</div>
          </div>
          <span class="mb-1 text-[13px] text-muted line-through">¥{{ money(product.originalPrice) }}</span>
          <span v-if="product.coupon > 0" class="brand-chip mb-1 rounded-[4px] px-2 py-1 text-[12px] font-medium">省 ¥{{ money(product.coupon) }}</span>
        </div>

        <div class="mt-6 rounded-[8px] border border-dashed border-[#f3b6b6] bg-[#fff9f9] p-4">
          <div class="brand-text flex items-center gap-2 text-[13px] font-medium">
            <i class="ri-coupon-3-line text-[18px]"></i>{{ platform.couponTitle }}
            <span v-if="product.couponQuota > 0" class="ml-auto text-[11px] font-normal text-muted">满 ¥{{ money(product.couponQuota) }} 可用</span>
          </div>
          <p class="mt-2 text-[12px] leading-5 text-muted">{{ platform.detailNote }}</p>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <button type="button" class="flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] border border-line text-[13px] font-medium text-ink transition hover:border-ink" @click="copyPrimary(product)">
            <i class="ri-file-copy-line text-[18px]"></i>{{ platform.copyLabel }}
          </button>
          <button type="button" class="brand-bg flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-[7px] text-[13px] font-medium text-white transition" @click="openLink(product)">
            <i class="ri-external-link-line text-[18px]"></i>{{ platform.buyLabel }}
          </button>
        </div>
      </div>
    </template>
  </van-popup>
</template>
