<script setup lang="ts">
import { withDefaults } from 'vue';

interface Props {
  /** Se o dialog está aberto */
  isOpen: boolean;
  /** Título do dialog */
  title?: string;
  /** Altura máxima do dialog (padrão: 80vh) */
  maxHeight?: string;
  /** Se deve mostrar o botão de fechar (padrão: true) */
  showCloseButton?: boolean;
  /** Classe CSS adicional para o conteúdo */
  contentClass?: string;
}

withDefaults(defineProps<Props>(), {
  title: '',
  maxHeight: '80vh',
  showCloseButton: true,
  contentClass: '',
});

const emit = defineEmits<{
  /** Emitido quando o dialog deve ser fechado */
  close: [method?: 'button' | 'overlay' | 'retranslate'];
}>();

const handleClose = () => {
  emit('close');
};

const handleOverlayClick = () => {
  emit('close', 'overlay');
};

const handleContentClick = (event: Event) => {
  event.stopPropagation();
};
</script>

<template>
  <!-- Dialog de histórico para mobile -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[9999999999] xl:hidden"
      @click="handleOverlayClick"
    >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <!-- Dialog -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="transform translate-y-full"
        enter-to-class="transform translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="transform translate-y-0"
        leave-to-class="transform translate-y-full"
      >
        <div
          v-if="isOpen"
          class="absolute bottom-0 p-4 left-0 right-0 bg-midnight border-t border-primary rounded-t-2xl shadow-2xl overflow-hidden"
          :style="{ maxHeight }"
          @click="handleContentClick"
        >
          <!-- Header do dialog -->
          <div class="flex items-center justify-between mb-4">
            <h2 v-if="title" class="text-lg font-semibold text-white-smoke/80">
              {{ title }}
            </h2>
            <button
              v-if="showCloseButton"
              @click="handleClose"
              @mousedown.prevent="handleClose"
              @touchstart.prevent="handleClose"
              class="p-2 rounded-full hover:bg-white-smoke/10 transition-colors duration-200"
              aria-label="Fechar dialog"
              data-vlib-ignore="true"
              data-no-translate="true"
            >
              <i
                class="mdi mdi-close text-xl text-white-smoke/80"
                aria-hidden="true"
              ></i>
            </button>
          </div>

          <!-- Conteúdo do dialog -->
          <div
            class="overflow-y-auto"
            :class="contentClass"
            :style="{ maxHeight: `calc(${maxHeight} - 80px)` }"
          >
            <slot />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Estilos específicos do componente MobileDialog */
</style>
