<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  addMonths, 
  subMonths, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns'
import { th } from 'date-fns/locale' // Import Thai locale
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '../stores/workouts'

const router = useRouter()
const workoutStore = useWorkoutStore()
const currentMonth = ref(new Date())

// Fetch dates on mount
onMounted(() => {
    workoutStore.fetchWorkoutDates()
})

const days = computed(() => {
  const start = startOfWeek(startOfMonth(currentMonth.value))
  const end = endOfWeek(endOfMonth(currentMonth.value))
  return eachDayOfInterval({ start, end })
})

const nextMonth = () => currentMonth.value = addMonths(currentMonth.value, 1)
const prevMonth = () => currentMonth.value = subMonths(currentMonth.value, 1)

const goToDate = (date) => {
  if (date > new Date()) return // Prevent future dates
  router.push({ name: 'daily-workout', params: { date: format(date, 'yyyy-MM-dd') } })
}

const hasWorkout = (date) => {
    const formatted = format(date, 'yyyy-MM-dd')
    // Check against fetched marked dates
    return workoutStore.markedDates.includes(formatted)
}

const weekDays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-slate-800">
        {{ format(currentMonth, 'MMMM yyyy') }}
      </h2>
      <div class="flex space-x-2">
        <button @click="prevMonth" class="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button @click="nextMonth" class="p-2 hover:bg-slate-50 rounded-full text-slate-600 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
    
    <div class="grid grid-cols-7 gap-1 lg:gap-2 mb-2">
      <div v-for="day in weekDays" :key="day" class="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1">
        {{ day }}
      </div>
    </div>
    
    <div class="grid grid-cols-7 gap-1 lg:gap-2">
      <button 
        v-for="date in days" 
        :key="date"
        @click="goToDate(date)"
        class="aspect-square lg:h-24 lg:aspect-auto rounded-lg flex flex-col items-center justify-center py-2 relative transition border ring-inset"
        :class="[
          !isSameMonth(date, currentMonth) ? 'bg-slate-50 text-slate-300 border-transparent' : 
          date > new Date() ? 'bg-slate-50 text-slate-300 border-transparent cursor-not-allowed' :
          'bg-white border-slate-100 text-slate-700 hover:border-blue-300 hover:shadow-sm',
          isToday(date) ? 'ring-2 ring-blue-500 z-10' : ''
        ]"
      >
        <span class="text-sm font-medium" :class="isToday(date) ? 'text-blue-600' : ''">{{ format(date, 'd') }}</span>
        <div v-if="hasWorkout(date)" class="mt-1 flex items-center justify-center">
             <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
             </svg>
        </div>
      </button>
    </div>
  </div>
</template>
