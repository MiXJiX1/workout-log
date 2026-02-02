import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
    // Initialize from localStorage or system preference
    const storedTheme = localStorage.getItem('theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    const isDark = ref(storedTheme === 'dark' || (!storedTheme && systemDark))

    const toggleTheme = () => {
        isDark.value = !isDark.value
    }

    // Watch for changes and apply to HTML tag
    watch(isDark, (val) => {
        if (val) {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }, { immediate: true })

    return { isDark, toggleTheme }
})
