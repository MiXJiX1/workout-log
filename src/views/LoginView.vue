<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
    const result = await authStore.login(username.value, password.value)
    
    if (result.success) {
        router.push('/')
    } else {
        error.value = result.message || 'เข้าสู่ระบบล้มเหลว'
    }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-2 text-slate-800">ยินดีต้อนรับ</h1>
      <p class="text-center text-slate-500 mb-8">เข้าสู่ระบบเพื่อบันทึกการออกกำลังกาย</p>
      
      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
          <input 
            v-model="username" 
            type="text" 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="กรอกชื่อผู้ใช้"
            required
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
          <input 
            v-model="password" 
            type="password" 
            class="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            placeholder="กรอกรหัสผ่าน"
            required
          >
        </div>
        <div v-if="error" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{{ error }}</div>
        <button 
          type="submit" 
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition shadow-md active:scale-[0.98]"
        >
          เข้าสู่ระบบ
        </button>
      </form>

      <div class="mt-6 text-center text-sm text-slate-500">
          ยังไม่มีบัญชี? 
          <RouterLink to="/register" class="text-blue-600 hover:underline font-medium">สมัครสมาชิก</RouterLink>
      </div>
    </div>
  </div>
</template>
