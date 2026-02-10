import { createRouter, createWebHistory } from 'vue-router';
import Counter from '../views/Counter.vue';
import Liner from '../views/Liner.vue';
import QR from '../views/QR.vue'

const routes = [
    {
        path: '/',
        name: 'Counter',
        component: Counter,
        meta: { title: 'Excel Processor', emoji: '📊' }
    },
    {
        path: '/liner',
        name: 'Liner',
        component: Liner,
        meta: { title: 'Liner', emoji: '📏' }
    },
    {
        path: '/qr',
        name: 'QR',
        component: QR,
        meta: { title: 'QR', emoji: '📶' }
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});

router.afterEach((to) => {
    const title = to.meta.title || 'My Project';
    const emoji = to.meta.emoji || '🍎';

    // 1. 브라우저 탭 제목 변경
    document.title = title;

    // 2. 파비콘(이모지) 변경
    const link = document.querySelector("link[rel*='icon']");
    if (link) {
        link.href = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${emoji}</text></svg>`;
    }
});