<script setup>
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import { useRoute, useRouter } from 'vue-router'
import { computed, ref } from 'vue'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const route = useRoute()
const $router = useRouter()

const isDashboard = computed(() => route.name === 'dashboard')
const isExercises = computed(() => route.name === 'exercises')
const isSchedule = computed(() => route.name === 'schedule')

const isMobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <nav class="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <h1 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">WorkoutLog</h1>
          </div>
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <RouterLink 
              to="/" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              :class="[isDashboard ? 'border-indigo-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700']"
            >
              แดชบอร์ด
            </RouterLink>
            <RouterLink 
              to="/exercises" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              :class="[isExercises ? 'border-indigo-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700']"
            >
              ท่าออกกำลังกาย
            </RouterLink>
            <RouterLink 
              to="/schedule" 
              class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              :class="[isSchedule ? 'border-indigo-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700']"
            >
              ตารางฝึก
            </RouterLink>
          </div>
        </div>
        
        <!-- Desktop User Menu -->
        <div class="hidden sm:flex sm:items-center space-x-4">
          <!-- Theme Toggle -->
          <button @click="themeStore.toggleTheme" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
              <!-- Sun Icon -->
              <svg v-if="!themeStore.isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <!-- Moon Icon -->
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
          </button>

          <span class="text-sm text-slate-600 dark:text-slate-300" v-if="authStore.user">สวัสดี, {{ authStore.userProfile?.username || 'ผู้ใช้งาน' }}</span>
          <button 
            @click="authStore.logout($router)" 
            class="text-sm font-medium text-slate-500 hover:text-red-600 dark:text-slate-400 transition"
          >
            ออกจากระบบ
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <div class="-mr-2 flex items-center sm:hidden space-x-2">
           <button @click="themeStore.toggleTheme" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
             <svg v-if="!themeStore.isDark" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
           </button>
          <button @click="toggleMobileMenu" type="button" class="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
            <span class="sr-only">Open main menu</span>
            <svg class="h-6 w-6" v-if="!isMobileMenuOpen" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
             <svg class="h-6 w-6" v-else fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div class="sm:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" v-show="isMobileMenuOpen">
      <div class="pt-2 pb-3 space-y-1">
        <RouterLink 
          to="/" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
           :class="[isDashboard ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200']"
           @click="isMobileMenuOpen = false"
        >
          แดชบอร์ด
        </RouterLink>
         <RouterLink 
          to="/exercises" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
           :class="[isExercises ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200']"
           @click="isMobileMenuOpen = false"
        >
          ท่าออกกำลังกาย
        </RouterLink>
         <RouterLink 
          to="/schedule" 
          class="block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors"
           :class="[isSchedule ? 'bg-indigo-50 dark:bg-slate-800 border-indigo-500 text-indigo-700 dark:text-indigo-400' : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-800 dark:hover:text-slate-200']"
           @click="isMobileMenuOpen = false"
        >
          ตารางฝึก
        </RouterLink>
      </div>
      <div class="pt-4 pb-4 border-t border-slate-200 dark:border-slate-800">
         <div class="flex items-center px-4 mb-3">
             <div class="text-base font-medium text-slate-800 dark:text-slate-200" v-if="authStore.user">{{ authStore.userProfile?.username || 'ผู้ใช้งาน' }}</div>
         </div>
         <div class="space-y-1">
             <button @click="authStore.logout($router)" class="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-red-600">
                 ออกจากระบบ
             </button>
         </div>
      </div>
    </div>
  </nav>
</template>
