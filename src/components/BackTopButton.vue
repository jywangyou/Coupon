<script setup>
defineProps({
  show: { type: Boolean, default: false }
})
const emit = defineEmits(['click'])
</script>

<template>
  <button
    v-if="show"
    type="button"
    class="absolute bottom-6 right-6 z-10 grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-[18px] text-ink shadow-soft transition hover:bg-[#f5f6f8]"
    title="回到顶部"
    @click="emit('click')"
  ><i class="ri-arrow-up-line"></i></button>
</template>
