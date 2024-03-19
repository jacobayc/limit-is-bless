// router/index.ts
import { createWebHistory, createRouter, RouteRecordRaw } from "vue-router";

import Home from '@/views/home.vue';
import List from '@/views/list.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/list',
    name: 'List',
    component: List
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
