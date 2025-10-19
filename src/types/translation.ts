export interface TranslationHistoryItem {
  id: string;
  text: string;
  created_at: number;
  status: 'traduzindo' | 'completa' | 'erro';
  videoBlob?: Blob; // Blob do vídeo gravado (apenas em memória)
}

export interface TranslationHistoryState {
  translations: TranslationHistoryItem[];
}
