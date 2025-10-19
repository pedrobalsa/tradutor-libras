import { ref, type Ref } from 'vue';

export interface UseVideoRecorderOptions {
  /** FPS da gravação (padrão: 60) */
  fps?: number;
  /** Callback executado quando a gravação é iniciada */
  onRecordingStart?: () => void;
  /** Callback executado quando a gravação é parada */
  onRecordingStop?: (blob: Blob) => void;
  /** Callback executado quando ocorre um erro na gravação */
  onError?: (error: string) => void;
}

export interface UseVideoRecorderReturn {
  /** Estado indicando se a gravação está em andamento */
  isRecording: Ref<boolean>;
  /** Função para iniciar a gravação */
  startRecording: () => Promise<void>;
  /** Função para parar a gravação */
  stopRecording: () => Promise<Blob | null>;
}

/**
 * Composable para gravação de vídeo do canvas VLibras
 */
export function useVideoRecorder(
  options: UseVideoRecorderOptions = {}
): UseVideoRecorderReturn {
  const { fps = 60, onRecordingStart, onRecordingStop, onError } = options;

  const isRecording = ref(false);
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];
  let watermarkCanvas: HTMLCanvasElement | null = null;
  let animationId: number | null = null;

  /**
   * Localiza o canvas do VLibras no DOM
   */
  const findCanvas = (): HTMLCanvasElement | null => {
    const canvas = document.querySelector(
      '#gameContainer canvas'
    ) as HTMLCanvasElement;
    return canvas && canvas.width > 0 && canvas.height > 0 ? canvas : null;
  };

  /**
   * Aguarda o canvas estar disponível
   */
  const waitForCanvas = (
    maxAttempts = 5,
    delay = 200
  ): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const checkCanvas = () => {
        const canvas = findCanvas();
        if (canvas) {
          resolve(canvas);
          return;
        }

        if (++attempts >= maxAttempts) {
          reject(new Error('Canvas do VLibras não encontrado'));
          return;
        }

        setTimeout(checkCanvas, delay);
      };

      checkCanvas();
    });
  };

  /**
   * Cria canvas com marca d'água sobreposto ao canvas do VLibras
   */
  const createWatermarkCanvas = (
    sourceCanvas: HTMLCanvasElement
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Não foi possível criar contexto 2D');
    }

    // Configurar dimensões do canvas
    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';

    // Função para desenhar frame com marca d'água
    const drawFrame = () => {
      // Limpar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Desenhar o canvas do VLibras
      ctx.drawImage(sourceCanvas, 0, 0);

      // Configurar estilo da marca d'água
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = ' #10449c';
      ctx.strokeStyle = ' #ffffff';
      ctx.lineWidth = 1;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      // Posicionar marca d'água no canto inferior direito
      const padding = 20;
      const x = canvas.width - padding;
      const y = canvas.height - padding;

      // Desenhar texto com contorno
      const text = 'traduzlibras.com - vLibras';
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    };

    // Iniciar loop de animação
    const animate = () => {
      drawFrame();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return canvas;
  };

  /**
   * Limpa recursos da marca d'água
   */
  const cleanupWatermark = () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
    if (watermarkCanvas && watermarkCanvas.parentNode) {
      watermarkCanvas.parentNode.removeChild(watermarkCanvas);
      watermarkCanvas = null;
    }
  };

  /**
   * Inicia a gravação do canvas
   */
  const startRecording = async (): Promise<void> => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder não é suportado neste navegador');
      }

      const sourceCanvas = await waitForCanvas();

      // Criar canvas com marca d'água
      watermarkCanvas = createWatermarkCanvas(sourceCanvas);

      // Adicionar canvas ao DOM (posicionado sobre o canvas original)
      const gameContainer = document.querySelector('#gameContainer');
      if (gameContainer) {
        gameContainer.style.position = 'relative';
        gameContainer.appendChild(watermarkCanvas);
      }

      const stream = watermarkCanvas.captureStream(fps);

      if (!stream || stream.getVideoTracks().length === 0) {
        throw new Error('Não foi possível capturar stream do canvas');
      }

      const options: MediaRecorderOptions = {
        mimeType: 'video/mp4; codecs=avc1.42E01E',
        videoBitsPerSecond: 8000000,
      };

      mediaRecorder = new MediaRecorder(stream, options);
      recordedChunks = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data && event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/mp4' });
        onRecordingStop?.(blob);
      };

      mediaRecorder.onerror = () => {
        onError?.('Erro na gravação');
        isRecording.value = false;
      };

      mediaRecorder.start(100);
      isRecording.value = true;
      onRecordingStart?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido na gravação';
      onError?.(errorMessage);
      isRecording.value = false;
      throw error;
    }
  };

  /**
   * Para a gravação e retorna o Blob do vídeo
   */
  const stopRecording = async (): Promise<Blob | null> => {
    try {
      if (!mediaRecorder || !isRecording.value) {
        return null;
      }

      return new Promise(resolve => {
        if (!mediaRecorder) {
          resolve(null);
          return;
        }

        const originalOnStop = mediaRecorder.onstop;
        mediaRecorder.onstop = function (event) {
          originalOnStop?.call(this, event);
          const mimeType = mediaRecorder?.mimeType || 'video/mp4';
          const blob = new Blob(recordedChunks, { type: mimeType });
          isRecording.value = false;

          // Limpar recursos da marca d'água
          cleanupWatermark();

          resolve(blob);
        };

        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          isRecording.value = false;
          cleanupWatermark();
          resolve(null);
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao parar gravação';
      onError?.(errorMessage);
      isRecording.value = false;
      cleanupWatermark();
      return null;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
