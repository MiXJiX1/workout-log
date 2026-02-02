<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

const time = ref(new Date())
let interval

onMounted(() => {
  interval = setInterval(() => {
    time.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center h-full min-h-[150px]">
    <div class="text-4xl lg:text-5xl font-bold text-slate-800 tracking-tight font-mono">
      {{ format(time, 'HH:mm:ss') }}
    </div>
    <div class="text-slate-500 mt-2 text-lg">
      {{ format(time, 'EEEE, d MMMM yyyy') }}
    </div>
  </div>
</template>
