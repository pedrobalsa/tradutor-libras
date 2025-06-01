import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { trackPage, trackNavigation } from '../utils/analytics';

// Importar componentes de forma lazy
const Home = () => import('../views/Home.vue');
const TraducaoSimultanea = () => import('../views/TraducaoSimultanea.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Traduz Libras | Tradutor Online para Língua Brasileira de Sinais',
      description:
        'Traduz Libras: tradutor online gratuito para Libras. Converta texto em português para Língua Brasileira de Sinais de forma rápida e acessível. Interface moderna e intuitiva.',
    },
  },
  {
    path: '/traducao-simultanea',
    name: 'TraducaoSimultanea',
    component: TraducaoSimultanea,
    meta: {
      title: 'Tradução Simultânea para Libras | Traduz Libras',
      description:
        'Tradução simultânea para Libras com reconhecimento de voz em tempo real. Fale em português e veja a tradução instantânea em Língua Brasileira de Sinais com controle de fila.',
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

// Atualizar meta tags e tracking em mudanças de rota
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

// Tracking após mudança de rota
router.afterEach((to, from) => {
  // Track page view
  const pageTitle = (to.meta?.title as string) || 'Traduz Libras';
  const pageLocation = window.location.href;

  // Delay para garantir que a página carregou
  setTimeout(() => {
    trackPage(pageTitle, pageLocation);
  }, 100);

  // Track navigation se não for a primeira visita
  if (from.name) {
    const fromPage = from.name as string;
    const toPage = to.name as string;
    trackNavigation(fromPage, toPage);
  }
});

export default router;
