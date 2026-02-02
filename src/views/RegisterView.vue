<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter, RouterLink } from 'vue-router'

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleRegister = async () => {
    if (password.value !== confirmPassword.value) {
        error.value = 'รหัสผ่านไม่ตรงกัน'
        return
    }
    
    // Register API call
    const result = await authStore.register(username.value, password.value)
    
    if (result.success) {
        router.push('/')
    } else {
        error.value = result.message
    }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-2 text-slate-800">สมัครสมาชิก</h1>
      <p class="text-center text-slate-500 mb-8">สร้างบัญชีสำหรับบันทึกการออกกำลังกาย</p>
      
      <form @submit.prevent="handleRegister" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="ตั้งชื่อผู้ใช้ของคุณ"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="ตั้งรหัสผ่าน"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่าน</label>
          <input 
            v-model="confirmPassword" 
            type="password" 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="ใส่รหัสผ่านอีกครั้ง"
            required
          >
        </div>
        <div v-if="error" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{{ error }}</div>
        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md active:scale-[0.98]"
        >
          สมัครสมาชิก
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-500">
          มีบัญชีอยู่แล้ว? 
          <RouterLink to="/login" class="text-blue-600 hover:underline font-medium">เข้าสู่ระบบ</RouterLink>
      </div>
    </div>
  </div>
</template>
