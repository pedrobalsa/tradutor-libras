import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Importar componentes de forma lazy
const Home = () => import('../views/Home.vue');
const TraducaoSimultanea = () => import('../views/TraducaoSimultanea.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title:
        'Tradutor para Libras Online Gratuito | Tradução em Língua Brasileira de Sinais',
      description:
        'Tradutor online gratuito para Libras (Língua Brasileira de Sinais). Converta texto em português para linguagem de sinais de forma rápida e acessível.',
    },
  },
  {
    path: '/traducao-simultanea',
    name: 'TraducaoSimultanea',
    component: TraducaoSimultanea,
    meta: {
      title: 'Tradução Simultânea para Libras | Tradutor Libras',
      description:
        'Tradução simultânea para Libras com detecção automática do fim da tradução. Acompanhe o progresso em tempo real e controle a reprodução.',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Atualizar meta tags em mudanças de rota
router.beforeEach((to, _from, next) => {
  // Atualizar título da página
  if (to.meta?.title) {
    document.title = to.meta.title as string;
  }

  // Atualizar meta description
  if (to.meta?.description) {
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string);
    }
  }

  next();
});

export default router;
