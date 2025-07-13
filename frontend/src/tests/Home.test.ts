import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: Home }],
})

const pinia = createPinia()

describe('home.vue', () => {
  it('renders the title correctly', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('Covey Todo App')
  })

  it('renders the description correctly', () => {
    const wrapper = mount(Home, {
      global: {
        plugins: [router, pinia],
      },
    })

    expect(wrapper.text()).toContain('時間管理マトリックスを使ったタスク管理アプリ')
  })
})
