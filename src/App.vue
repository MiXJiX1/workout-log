<script setup>
import { RouterView, useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import { computed } from 'vue'

const route = useRoute()
const showNavbar = computed(() => !['login', 'register'].includes(route.name))
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <Navbar v-if="showNavbar" />
    <main :class="{ 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8': showNavbar }">
      <RouterView />
    </main>
  </div>
</template>
