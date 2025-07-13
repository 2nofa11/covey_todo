import { createRouter, createWebHistory } from 'vue-router'
import Index from '@/pages/index.vue'
import Week from '@/pages/week.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Index',
      component: Index,
    },
    {
      path: '/week',
      name: 'Week',
      component: Week,
    },
  ],
})

export default router
