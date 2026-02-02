import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

export const useWorkoutStore = defineStore('workouts', () => {
    const workouts = ref({})
    const currentViewSessions = ref([])
    const markedDates = ref([])

    const getUserId = () => {
        const authStore = useAuthStore()
        return authStore.user?.id
    }

    const getWorkoutSync = (date) => {
        return workouts.value[date] || []
    }

    async function fetchWorkout(date) {
        const userId = getUserId()
        if (!userId) return

        try {
            // Fetch sessions with exercise details using Supabase join syntax
            const { data: sessions, error } = await supabase
                .from('workout_sessions')
                .select(`
                    id, 
                    exercise_id, 
                    workout_date,
                    exercises ( name, category ),
                    workout_sets ( id, weight, reps, is_completed )
                `)
                .eq('user_id', userId)
                .eq('workout_date', date)
                .order('id', { ascending: true })

            if (error) throw error

            if (sessions) {
                // Transform data to match frontend expectation
                const formattedSessions = sessions.map(s => ({
                    id: s.id,
                    exercise_id: s.exercise_id,
                    exerciseName: s.exercises?.name || 'Unknown',
                    exerciseCategory: s.exercises?.category || '',
                    workout_date: s.workout_date,
                    sets: s.workout_sets
                        ? s.workout_sets
                            .map(set => ({
                                id: set.id,
                                weight: set.weight,
                                reps: set.reps,
                                completed: set.is_completed
                            }))
                            .sort((a, b) => a.id - b.id)
                        : []
                }))

                currentViewSessions.value = formattedSessions
                // cache
                workouts.value[date] = formattedSessions
            }
        } catch (e) {
            console.error('Error fetching workouts:', e.message)
        }
    }

    async function fetchWorkoutDates() {
        const userId = getUserId()
        if (!userId) return

        try {
            const { data, error } = await supabase
                .from('workout_sessions')
                .select('workout_date')
                .eq('user_id', userId)

            if (error) throw error

            if (data) {
                // Unique dates
                const dates = [...new Set(data.map(item => item.workout_date))]
                markedDates.value = dates
            }
        } catch (e) {
            console.error(e)
        }
    }

    async function addSession(date, exercise) {
        const userId = getUserId()
        try {
            // 1. Create Session
            const { data: sessionData, error: sessionError } = await supabase
                .from('workout_sessions')
                .insert([{
                    user_id: userId,
                    exercise_id: exercise.id,
                    workout_date: date
                }])
                .select()
                .single()

            if (sessionError) throw sessionError

            if (sessionData) {
                // 2. Create Initial Set
                const { data: setData, error: setError } = await supabase
                    .from('workout_sets')
                    .insert([{ session_id: sessionData.id, weight: 0, reps: 0 }])
                    .select()
                    .single()

                if (setError) throw setError

                // Update Local State
                const newSession = {
                    id: sessionData.id,
                    exercise_id: exercise.id,
                    exerciseName: exercise.name,
                    sets: [{ id: setData.id, weight: 0, reps: 0, completed: false }]
                }

                workouts.value[date] = [...(workouts.value[date] || []), newSession]
                if (!markedDates.value.includes(date)) markedDates.value.push(date)
            }
        } catch (e) {
            console.error('Error adding session:', e.message)
        }
    }

    async function removeSession(date, sessionId) {
        try {
            const { error } = await supabase
                .from('workout_sessions')
                .delete()
                .eq('id', sessionId)

            if (error) throw error

            if (workouts.value[date]) {
                workouts.value[date] = workouts.value[date].filter(s => s.id !== sessionId)
            }
            // Ideally re-fetch dates if empty
        } catch (e) { console.error(e) }
    }

    async function addSet(date, sessionId) {
        try {
            const { data, error } = await supabase
                .from('workout_sets')
                .insert([{ session_id: sessionId, weight: 0, reps: 0 }])
                .select()
                .single()

            if (error) throw error

            const session = workouts.value[date]?.find(s => s.id === sessionId)
            if (session) {
                session.sets.push({ id: data.id, weight: 0, reps: 0, completed: false })
            }
        } catch (e) { console.error(e) }
    }

    async function removeSet(date, sessionId, setId) {
        try {
            const { error } = await supabase
                .from('workout_sets')
                .delete()
                .eq('id', setId)

            if (error) throw error

            const session = workouts.value[date]?.find(s => s.id === sessionId)
            if (session) {
                session.sets = session.sets.filter(s => s.id !== setId)
            }
        } catch (e) { console.error(e) }
    }

    async function updateSet(date, sessionId, setId, data) {
        // Map frontend 'completed' to DB 'is_completed'
        const updateData = { ...data }
        if (updateData.completed !== undefined) {
            updateData.is_completed = updateData.completed
            delete updateData.completed
        }

        try {
            const { error } = await supabase
                .from('workout_sets')
                .update(updateData)
                .eq('id', setId)

            if (error) throw error

            const session = workouts.value[date]?.find(s => s.id === sessionId)
            if (session) {
                const setIndex = session.sets.findIndex(s => s.id === setId)
                if (setIndex !== -1) {
                    session.sets[setIndex] = { ...session.sets[setIndex], ...data }
                }
            }
        } catch (e) { console.error(e) }
    }

    return { workouts, getWorkoutSync, fetchWorkout, addSession, removeSession, addSet, removeSet, updateSet, fetchWorkoutDates, markedDates }
})
