<script setup>
import { ref, onMounted } from 'vue'
import { useScheduleStore } from '../stores/schedule'

const scheduleStore = useScheduleStore()
const isModalOpen = ref(false)
const selectedDay = ref(null) // 1-7
const editForm = ref({ target: '', isRest: false, note: '' })

const days = [
    { id: 1, name: 'จันทร์', color: 'bg-yellow-100 text-yellow-800' },
    { id: 2, name: 'อังคาร', color: 'bg-pink-100 text-pink-800' },
    { id: 3, name: 'พุธ', color: 'bg-green-100 text-green-800' },
    { id: 4, name: 'พฤหัสบดี', color: 'bg-orange-100 text-orange-800' },
    { id: 5, name: 'ศุกร์', color: 'bg-blue-100 text-blue-800' },
    { id: 6, name: 'เสาร์', color: 'bg-purple-100 text-purple-800' },
    { id: 7, name: 'อาทิตย์', color: 'bg-red-100 text-red-800' },
]

onMounted(() => {
    scheduleStore.fetchSchedule()
})

const openEdit = (day) => {
    selectedDay.value = day
    const existing = scheduleStore.weeklyPlan[day.id]
    if (existing) {
        editForm.value = { 
            target: existing.target_body_part || '', 
            isRest: existing.is_rest_day || false, 
            note: existing.note || '' 
        }
    } else {
        editForm.value = { target: '', isRest: false, note: '' }
    }
    isModalOpen.value = true
}

const save = async () => {
    if (!selectedDay.value) return
    await scheduleStore.saveDayPlan(selectedDay.value.id, editForm.value)
    isModalOpen.value = false
}

const removePlan = async () => {
    if (!selectedDay.value) return
    if (confirm('ต้องการลบแผนการฝึกของวันนี้ใช่หรือไม่?')) {
        await scheduleStore.deleteDayPlan(selectedDay.value.id)
        isModalOpen.value = false
    }
}
</script>

<template>
<div class="space-y-6 px-4 py-4 sm:px-0">
    <div class="flex items-center justify-between">
       <div>
         <h1 class="text-2xl font-bold text-slate-900">ตารางการฝึก</h1>
         <p class="text-slate-500">วางแผนการออกกำลังกายประจำสัปดาห์</p>
       </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
            v-for="day in days" 
            :key="day.id" 
            class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition cursor-pointer group"
            @click="openEdit(day)"
        >
            <div class="px-4 py-2 font-bold text-sm flex justify-between items-center" :class="day.color">
                <span>{{ day.name }}</span>
                <svg class="w-4 h-4 opacity-0 group-hover:opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </div>
            <div class="p-4 h-32 flex flex-col justify-center items-center text-center">
                <div v-if="scheduleStore.weeklyPlan[day.id]?.is_rest_day" class="text-slate-400 font-medium flex flex-col items-center">
                     <span class="text-2xl mb-1">💤</span>
                     <span>พักผ่อน</span>
                </div>
                <div v-else-if="scheduleStore.weeklyPlan[day.id]?.target_body_part" class="w-full">
                    <h3 class="text-xl font-bold text-slate-800 mb-1">{{ scheduleStore.weeklyPlan[day.id].target_body_part }}</h3>
                    <p class="text-xs text-slate-500 line-clamp-2">{{ scheduleStore.weeklyPlan[day.id].note }}</p>
                </div>
                <div v-else class="text-slate-300 text-sm">
                    + แตะเพื่อเพิ่มแผน
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 class="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                <span class="w-3 h-8 rounded-full" :class="selectedDay.color.split(' ')[0]"></span>
                {{ selectedDay.name }}
            </h2>
            
            <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                    <input type="checkbox" id="restDay" v-model="editForm.isRest" class="w-5 h-5 rounded text-blue-600 focus:ring-blue-500">
                    <label for="restDay" class="text-slate-700 font-medium">วันพักผ่อน (Rest Day)</label>
                </div>

                <div v-if="!editForm.isRest">
                    <label class="block text-sm font-medium text-slate-700 mb-1">เน้นส่วนไหน? (Target)</label>
                    <input v-model="editForm.target" type="text" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="เช่น อก, ขา, คาร์ดิโอ">
                </div>

                 <div v-if="!editForm.isRest">
                    <label class="block text-sm font-medium text-slate-700 mb-1">โน๊ตเพิ่มเติม</label>
                    <textarea v-model="editForm.note" rows="3" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" placeholder="รายละเอียด..."></textarea>
                </div>
            </div>

            <div class="flex justify-between items-center mt-8">
                <button 
                    v-if="scheduleStore.weeklyPlan[selectedDay.id]"
                    @click="removePlan" 
                    class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                >
                    ลบ
                </button>
                <div v-else></div> <!-- Spacer -->

                <div class="flex space-x-3">
                    <button @click="isModalOpen = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">ยกเลิก</button>
                    <button @click="save" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">บันทึก</button>
                </div>
            </div>
        </div>
    </div>
</div>
</template>
