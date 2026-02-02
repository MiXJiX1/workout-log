import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)

    const userProfile = ref(null)

    // Helper to fetch profile
    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('username')
                .eq('id', userId)
                .single()

            if (data) {
                userProfile.value = data
            }
        } catch (e) {
            console.error('Error fetching profile:', e)
        }
    }

    // Sync session on load
    supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
            user.value = data.session.user
            localStorage.setItem('user', JSON.stringify(data.session.user))
            fetchProfile(data.session.user.id)
        }
    })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
            user.value = session.user
            localStorage.setItem('user', JSON.stringify(session.user))
            fetchProfile(session.user.id)
        } else {
            user.value = null
            userProfile.value = null
            localStorage.removeItem('user')
        }
    })

    // Dummy email generator (since Supabase requires email)
    const getEmail = (username) => `${username}@workout-app-user.com`

    async function login(username, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: getEmail(username),
                password
            })
            if (error) throw error
            return { success: true }
        } catch (e) {
            console.error(e)
            // Show friendlier message
            let msg = e.message
            if (msg.includes('Invalid login credentials')) msg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
            return { success: false, message: msg }
        }
    }

    async function register(username, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: getEmail(username),
                password,
                options: {
                    data: { username: username } // valid metadata
                }
            })
            if (error) throw error

            // Check if session is missing (confirmation might be on)
            if (data.user && !data.session) {
                // Try logging in immediately to check if confirmation is truly required or just weird session behavior
                const loginRes = await login(username, password)
                if (loginRes.success) return { success: true }

                return { success: true, message: 'สมัครสมาชิกสำเร็จ! (หากเข้าไม่ได้ กรุณาปิด Confirm Email ใน Supabase)' }
            }

            return { success: true }
        } catch (e) {
            console.error(e)
            return { success: false, message: e.message }
        }
    }

    async function logout(router) {
        await supabase.auth.signOut()
        user.value = null
        localStorage.removeItem('user')
        if (router) router.push('/login')
    }

    return { user, userProfile, login, logout, register }
})
