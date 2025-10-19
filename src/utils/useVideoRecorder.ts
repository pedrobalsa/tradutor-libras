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
   * Inicia a gravação do canvas
   */
  const startRecording = async (): Promise<void> => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder não é suportado neste navegador');
      }

      const canvas = await waitForCanvas();
      const stream = canvas.captureStream(fps);

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
          resolve(blob);
        };

        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        } else {
          isRecording.value = false;
          resolve(null);
        }
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao parar gravação';
      onError?.(errorMessage);
      isRecording.value = false;
      return null;
    }
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
}
