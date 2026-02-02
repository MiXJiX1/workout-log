import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'

export const useScheduleStore = defineStore('schedule', () => {
    const weeklyPlan = ref({}) // Map of day_of_week -> { id, target_body_part, ... }
    const loading = ref(false)

    async function fetchSchedule() {
        loading.value = true
        try {
            const { data, error } = await supabase
                .from('weekly_schedule')
                .select('*')
                .order('day_of_week')

            if (error) throw error

            // Convert array to map for easy access by day index
            const map = {}
            if (data) {
                data.forEach(item => {
                    map[item.day_of_week] = item
                })
            }
            weeklyPlan.value = map
        } catch (e) {
            console.error(e)
        } finally {
            loading.value = false
        }
    }

    async function saveDayPlan(dayOfWeek, data) {
        // Check if exists
        const existing = weeklyPlan.value[dayOfWeek]
        const payload = {
            user_id: (await supabase.auth.getUser()).data.user.id,
            day_of_week: dayOfWeek,
            target_body_part: data.target,
            is_rest_day: data.isRest,
            note: data.note
        }

        try {
            const { data: result, error } = await supabase
                .from('weekly_schedule')
                .upsert(payload, { onConflict: 'user_id, day_of_week' })
                .select()
                .single()

            if (error) throw error
            weeklyPlan.value[dayOfWeek] = result
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    async function deleteDayPlan(dayOfWeek) {
        try {
            const { error } = await supabase
                .from('weekly_schedule')
                .delete()
                .eq('user_id', (await supabase.auth.getUser()).data.user.id)
                .eq('day_of_week', dayOfWeek)

            if (error) throw error
            delete weeklyPlan.value[dayOfWeek]
            return true
        } catch (e) {
            console.error(e)
            return false
        }
    }

    return { weeklyPlan, fetchSchedule, saveDayPlan, deleteDayPlan, loading }
})
