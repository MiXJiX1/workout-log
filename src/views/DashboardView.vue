<script setup>
import RealTimeClock from '../components/RealTimeClock.vue'
import CalendarWidget from '../components/CalendarWidget.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="space-y-6 px-4 py-4 sm:px-0">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">แดชบอร์ด</h1>
        <p class="text-slate-500">ติดตามความคืบหน้าและตารางการฝึกของคุณ</p>
      </div>
      <div class="hidden md:block">
         <!-- Optional Actions -->
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Clock Section -->
      <div class="lg:col-span-1">
        <RealTimeClock />
        
        <!-- Quick Stats or Quote could go here below clock -->
        <div class="mt-6 bg-blue-600 rounded-xl shadow-sm p-6 text-white hidden lg:block">
            <h3 class="font-bold text-lg mb-2">สู้ต่อไป!</h3>
            <p class="text-blue-100">"ไม่มีการออกกำลังกายที่แย่ มีแต่การไม่ออกกำลังกายเท่านั้น"</p>
        </div>
      </div>
      
      <!-- Calendar Section -->
      <div class="lg:col-span-2">
        <CalendarWidget />
      </div>
    </div>
  </div>
</template>
