<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWorkoutStore } from '../stores/workouts.js'
import { useExerciseStore } from '../stores/exercises.js'
import { format, parseISO } from 'date-fns'
import { th } from 'date-fns/locale'

const route = useRoute()
const date = route.params.date
const workoutStore = useWorkoutStore()
const exerciseStore = useExerciseStore()

// Initial Fetch
onMounted(() => {
    workoutStore.fetchWorkout(date)
    exerciseStore.fetchExercises()
})

const sessions = computed(() => workoutStore.getWorkoutSync(date))
const availableExercises = computed(() => exerciseStore.exercises)

const isAddModalOpen = ref(false)
const selectedExerciseId = ref('')
const selectedCategory = ref(null)

const categories = computed(() => {
    const cats = availableExercises.value.map(e => e.category).filter(Boolean)
    return [...new Set(cats)].sort()
})

const filteredExercises = computed(() => {
    if (!selectedCategory.value) return []
    return availableExercises.value.filter(e => e.category === selectedCategory.value)
})

const getCategoryIcon = (cat) => {
    const map = {
        'Chest': '🦍', 'อก': '🦍',
        'Back': '🦅', 'หลัง': '🦅',
        'Legs': '🦵', 'ขา': '🦵',
        'Shoulders': '🥥', 'ไหล่': '🥥',
        'Arms': '💪', 'แขน': '💪',
        'Core': '🍫', 'หน้าท้อง': '🍫',
        'Cardio': '🏃', 'คาร์ดิโอ': '🏃'
    }
    return map[cat] || '🏋️'
}

const getCategoryStyle = (cat) => {
    const map = {
        'Chest': 'bg-red-50 hover:bg-red-100 border-red-200',
        'Back': 'bg-blue-50 hover:bg-blue-100 border-blue-200',
        'Legs': 'bg-orange-50 hover:bg-orange-100 border-orange-200',
        'Shoulders': 'bg-purple-50 hover:bg-purple-100 border-purple-200',
        'Arms': 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200',
        'Core': 'bg-green-50 hover:bg-green-100 border-green-200',
        'Cardio': 'bg-cyan-50 hover:bg-cyan-100 border-cyan-200'
    }
    // Simple lookup or default default
    const key = Object.keys(map).find(k => cat.includes(k))
    return key ? map[key] : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
}

const addSession = () => {
    const exercise = availableExercises.value.find(e => e.id === selectedExerciseId.value)
    if (exercise) {
        workoutStore.addSession(date, exercise)
        isAddModalOpen.value = false
        selectedExerciseId.value = ''
        selectedCategory.value = null
    }
}

const toggleSet = (sessionId, set) => {
    workoutStore.updateSet(date, sessionId, set.id, { completed: !set.completed })
}

const updateSetData = (sessionId, set, field, value) => {
    workoutStore.updateSet(date, sessionId, set.id, { [field]: value })
}
</script>

<template>
  <div class="space-y-6 px-4 py-4 sm:px-0">
    <div class="flex items-center justify-between">
       <div>
         <h1 class="text-2xl font-bold text-slate-900">บันทึกการออกกำลังกาย</h1>
         <p class="text-slate-500">{{ format(parseISO(date), 'EEEE d MMMM yyyy', { locale: th }) }}</p>
       </div>
       <button @click="isAddModalOpen = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-sm transition flex items-center gap-2 font-medium">
         <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
         เพิ่มท่า
       </button>
    </div>

    <div class="space-y-4">
        <div v-for="(session, index) in sessions" :key="session.id" class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                <h3 class="font-bold text-slate-700 text-lg">{{ session.exerciseName }}</h3>
                <button @click="workoutStore.removeSession(date, session.id)" class="text-slate-400 hover:text-red-600 transition p-1">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
            
            <div class="p-4">
                <div class="grid grid-cols-12 gap-2 lg:gap-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wide text-center">
                    <div class="col-span-1">เซ็ต</div>
                    <div class="col-span-4">นน. (กก.)</div>
                    <div class="col-span-4">ครั้ง</div>
                    <div class="col-span-3">สำเร็จ</div>
                </div>

                <div v-for="(set, sIndex) in session.sets" :key="set.id" class="grid grid-cols-12 gap-2 lg:gap-4 mb-3 items-center group">
                    <div class="col-span-1 text-center font-medium text-slate-400">{{ sIndex + 1 }}</div>
                    <div class="col-span-4">
                        <input 
                            type="number" 
                            :value="set.weight" 
                            @input="updateSetData(session.id, set, 'weight', parseFloat($event.target.value))"
                            class="w-full text-center border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="0"
                        >
                    </div>
                    <div class="col-span-4">
                        <input 
                            type="number" 
                            :value="set.reps" 
                             @input="updateSetData(session.id, set, 'reps', parseFloat($event.target.value))"
                            class="w-full text-center border border-slate-200 rounded-lg py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-50 focus:bg-white"
                            placeholder="0"
                        >
                    </div>
                    <div class="col-span-3 flex justify-center items-center relative">
                        <button 
                            @click="toggleSet(session.id, set)"
                            class="w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm"
                            :class="set.completed ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'"
                        >
                            <svg v-if="set.completed" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        </button>
                        
                        <!-- Delete set button (optional, small X next to it) -->
                        <button @click="workoutStore.removeSet(date, session.id, set.id)" class="absolute -right-2 lg:-right-4 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                             <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                
                <button @click="workoutStore.addSet(date, session.id)" class="w-full mt-2 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition border border-dashed border-blue-200 flex items-center justify-center gap-1">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    เพิ่มเซ็ต
                </button>
            </div>
        </div>

        <div v-if="sessions.length === 0" class="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
            <div class="bg-blue-50 p-4 rounded-full mb-4 text-blue-500">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <h3 class="text-lg font-medium text-slate-800 mb-1">วันนี้พักผ่อน?</h3>
            <p class="text-slate-500 mb-6">ยังไม่มีรายการออกกำลังกายวันนี้</p>
            <button @click="isAddModalOpen = true" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium">เริ่มออกกำลังกาย</button>
        </div>
    </div>

    <!-- Add Exercise Modal -->
    <div v-if="isAddModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col transform transition-all">
            <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div class="flex items-center gap-2">
                    <button v-if="selectedCategory" @click="selectedCategory = null" class="text-slate-400 hover:text-slate-600 transition">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 class="text-xl font-bold text-slate-800">{{ selectedCategory ? selectedCategory : 'เลือกหมวดหมู่' }}</h2>
                </div>
                <button @click="isAddModalOpen = false; selectedCategory = null" class="text-slate-400 hover:text-slate-600 transition">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div class="p-6 overflow-y-auto">
                <!-- Step 1: Category Selection -->
                <div v-if="!selectedCategory" class="grid grid-cols-2 gap-4">
                    <button 
                        v-for="cat in categories" 
                        :key="cat"
                        @click="selectedCategory = cat"
                        class="aspect-video rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition hover:scale-105 active:scale-95 shadow-sm border border-slate-100 relative overflow-hidden group"
                        :class="getCategoryStyle(cat)"
                    >
                         <!-- Icon/Emoji Placeholder -->
                         <span class="text-3xl">{{ getCategoryIcon(cat) }}</span>
                         <span class="font-bold text-slate-700 group-hover:text-slate-900">{{ cat }}</span>
                    </button>
                </div>

                <!-- Step 2: Exercise Selection -->
                <div v-else class="space-y-2">
                    <button 
                        v-for="exercise in filteredExercises" 
                        :key="exercise.id"
                        @click="selectedExerciseId = exercise.id; addSession()"
                        class="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-between group"
                    >
                        <span class="font-medium text-slate-700 group-hover:text-blue-700">{{ exercise.name }}</span>
                        <svg class="w-5 h-5 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    </button>

                    <div v-if="filteredExercises.length === 0" class="text-center py-8 text-slate-500">
                        ไม่มีท่าออกกำลังกายในหมวดหมู่นี้
                    </div>
                    
                    <div class="pt-4 border-t border-slate-100 mt-4">
                        <p class="text-xs text-center text-slate-400">
                            หาไม่เจอ? <RouterLink to="/exercises" class="text-blue-600 hover:underline">จัดการท่าออกกำลังกาย</RouterLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>
