<script setup>
import { platformList } from '../constants/platforms'

defineProps({
  current: { type: String, required: true }
})
</script>

<template>
  <nav class="flex items-center gap-1.5" aria-label="平台切换">
    <RouterLink
      v-for="platform in platformList"
      :key="platform.id"
      :to="platform.homePath"
      class="grid h-9 w-9 place-items-center rounded-[8px] border transition"
      :class="platform.id === current ? 'border-[#dfe2e6] bg-white shadow-sm' : 'border-transparent opacity-45 grayscale hover:opacity-80'"
      :title="`切换到${platform.name}优惠`"
      :aria-label="`切换到${platform.name}优惠`"
    >
      <img :src="platform.icon" :alt="platform.name" class="h-6 w-6 rounded-[6px] object-contain" />
    </RouterLink>
  </nav>
</template>
