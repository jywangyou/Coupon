<script setup>
import { ref } from 'vue'

defineProps({
  categories: { type: Array, required: true },
  active: { type: String, required: true }
})
const emit = defineEmits(['select'])

const listRef = ref(null)

function handleWheel(event) {
  event.preventDefault()
  const el = listRef.value
  if (!el) return
  const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX) ? event.deltaY : event.deltaX
  el.scrollBy({ left: delta, behavior: 'smooth' })
}
</script>

<template>
  <section class="z-20 shrink-0 border-b border-line bg-[#f7f8fa]/95 py-3 backdrop-blur">
    <div class="content-width">
      <div ref="listRef" class="no-scrollbar flex gap-2 overflow-x-auto" @wheel.prevent="handleWheel">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="flex h-10 shrink-0 items-center gap-2 rounded-[8px] border px-4 text-[13px] font-medium transition"
          :class="active === category.id ? 'border-ink bg-ink text-white shadow-sm' : 'border-line bg-white text-muted hover:border-[#cfd3d8] hover:text-ink'"
          @click="emit('select', category)"
        >
          <i v-if="category.icon && !category.icon.startsWith('ri-')" class="text-[16px]" v-html="category.icon"></i>
          <i v-else :class="category.icon || 'ri-price-tag-3-line'" class="text-[16px]"></i>
          {{ category.label }}
        </button>
      </div>
    </div>
  </section>
</template>
