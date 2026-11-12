<script setup>
import PlatformTabs from './PlatformTabs.vue'

defineProps({
  platform: { type: Object, required: true }
})
const emit = defineEmits(['search'])
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-line bg-[#f7f8fa]/95 backdrop-blur">
    <div class="content-width relative flex h-[68px] items-center justify-between">
      <PlatformTabs :current="platform.id" />
      <h1 class="absolute left-1/2 -translate-x-1/2 text-[18px] font-semibold tracking-[-.02em] text-ink">{{ platform.title }}</h1>
      <button
        type="button"
        class="grid h-10 w-10 place-items-center rounded-[8px] text-[22px] text-ink transition hover:bg-white hover:text-[var(--brand)]"
        title="搜索优惠券"
        @click="emit('search')"
      ><i class="ri-search-line"></i></button>
    </div>
  </header>
</template>
