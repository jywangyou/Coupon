import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/taobao' },
  {
    path: '/taobao',
    name: 'taobao',
    component: () => import('../views/taobao/TaobaoHomeView.vue')
  },
  {
    path: '/jd',
    name: 'jd',
    component: () => import('../views/jd/JdHomeView.vue')
  },
  {
    path: '/search',
    name: 'search',
    component: () => import('../views/search/SearchView.vue')
  },
  { path: '/:pathMatch(.*)*', redirect: '/taobao' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.afterEach((to) => {
  const source = to.name === 'jd' ? 'jd' : (to.query.source === 'jd' ? 'jd' : 'taobao')
  document.title = source === 'jd' ? '省心券 · 京东优惠精选' : '省心券 · 淘宝优惠券精选'
})

export default router
