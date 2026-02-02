<script setup>
import { ref, onMounted } from 'vue'
import { useExerciseStore } from '../stores/exercises'

const exerciseStore = useExerciseStore()

onMounted(() => {
    exerciseStore.fetchExercises()
})

const isModalOpen = ref(false)
const isEditing = ref(false)
const currentExercise = ref({ id: null, name: '', category: '' })

const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio', 'Other']

const openAddModal = () => {
    isEditing.value = false
    currentExercise.value = { id: null, name: '', category: 'Chest' }
    isModalOpen.value = true
}

const openEditModal = (exercise) => {
    isEditing.value = true
    currentExercise.value = { ...exercise }
    isModalOpen.value = true
}

const saveExercise = () => {
    if (!currentExercise.value.name.trim()) return

    if (isEditing.value) {
        exerciseStore.updateExercise(currentExercise.value.id, currentExercise.value.name, currentExercise.value.category)
    } else {
        exerciseStore.addExercise(currentExercise.value.name, currentExercise.value.category)
    }
    isModalOpen.value = false
}

const deleteExercise = (id) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบท่าออกกำลังกายนี้?')) {
        exerciseStore.deleteExercise(id)
    }
}
</script>

<template>
<div class="space-y-6 px-4 py-4 sm:px-0">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-2xl font-bold text-slate-900">ท่าออกกำลังกาย</h1>
            <p class="text-slate-500 text-sm">จัดการท่าออกกำลังกายของคุณ</p>
        </div>
        <button 
            @click="openAddModal"
            class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
        >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            เพิ่มท่า
        </button>
    </div>

    <!-- List -->
    <div class="bg-white shadow-sm rounded-xl overflow-hidden border border-slate-200">
        <ul class="divide-y divide-slate-100">
            <li v-for="exercise in exerciseStore.exercises" :key="exercise.id" class="p-4 flex justify-between items-center hover:bg-slate-50 transition group">
                <div class="flex items-center gap-4">
                    <div class="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                        {{ exercise.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <h3 class="font-semibold text-slate-800">{{ exercise.name }}</h3>
                        <span class="inline-block text-slate-500 text-xs mt-0.5">{{ exercise.category }}</span>
                    </div>
                </div>
                <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal(exercise)" class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button @click="deleteExercise(exercise.id)" class="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                         <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            </li>
            <li v-if="exerciseStore.exercises.length === 0" class="p-8 text-center text-slate-500">
                ไม่พบข้อมูล. เพิ่มท่าออกกำลังกายใหม่ได้เลย!
            </li>
        </ul>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
        <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100">
            <h2 class="text-xl font-bold mb-4 text-slate-800">{{ isEditing ? 'แก้ไขท่าออกกำลังกาย' : 'เพิ่มท่าออกกำลังกาย' }}</h2>
            <form @submit.prevent="saveExercise" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อท่า</label>
                    <input v-model="currentExercise.name" type="text" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="เช่น Bench Press" required>
                </div>
                <div>
                    <label class="block text-sm font-medium text-slate-700 mb-1">หมวดหมู่</label>
                    <select v-model="currentExercise.category" class="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-3 mt-8">
                    <button type="button" @click="isModalOpen = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium">ยกเลิก</button>
                    <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">บันทึก</button>
                </div>
            </form>
        </div>
    </div>
</div>
</template>
