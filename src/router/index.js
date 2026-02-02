import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const DashboardView = () => import('../views/DashboardView.vue')

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'dashboard',
            component: DashboardView,
            meta: { requiresAuth: true }
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue')
        },
        {
            path: '/exercises',
            name: 'exercises',
            component: () => import('../views/ExerciseView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/schedule',
            name: 'schedule',
            component: () => import('../views/ScheduleView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/workout/:date',
            name: 'daily-workout',
            component: () => import('../views/DailyWorkoutView.vue'),
            meta: { requiresAuth: true }
        }
    ]
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    if (to.meta.requiresAuth && !authStore.user) {
        next('/login')
    } else {
        next()
    }
})

export default router
