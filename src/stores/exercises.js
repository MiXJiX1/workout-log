import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase'

export const useExerciseStore = defineStore('exercises', () => {
    const exercises = ref([])

    async function fetchExercises() {
        try {
            const { data, error } = await supabase
                .from('exercises')
                .select('*')
                .order('name', { ascending: true })

            if (error) throw error
            if (data) exercises.value = data
        } catch (e) {
            console.error('Error fetching exercises:', e.message)
        }
    }



    async function addExercise(name, category) {
        try {
            const { data, error } = await supabase
                .from('exercises')
                .insert([{ name, category }])
                .select()

            if (error) throw error
            if (data) exercises.value.push(data[0])
        } catch (e) {
            console.error('Error adding exercise:', e.message)
        }
    }

    async function updateExercise(id, name, category) {
        try {
            const { error } = await supabase
                .from('exercises')
                .update({ name, category })
                .eq('id', id)

            if (error) throw error

            const index = exercises.value.findIndex(e => e.id === id)
            if (index !== -1) {
                exercises.value[index] = { ...exercises.value[index], name, category }
            }
        } catch (e) {
            console.error('Error updating exercise:', e.message)
        }
    }

    async function deleteExercise(id) {
        try {
            const { error } = await supabase
                .from('exercises')
                .delete()
                .eq('id', id)

            if (error) throw error

            exercises.value = exercises.value.filter(e => e.id !== id)
        } catch (e) {
            console.error('Error deleting exercise:', e.message)
        }
    }

    return { exercises, fetchExercises, addExercise, updateExercise, deleteExercise }
})
