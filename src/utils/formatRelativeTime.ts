/**
 * Formata um timestamp para tempo relativo em português
 *
 * @param timestamp - Timestamp em milissegundos
 * @returns String formatada no formato relativo
 *
 * @example
 * formatRelativeTime(Date.now() - 30000) // "Há 30 seg"
 * formatRelativeTime(Date.now() - 300000) // "Há 5 min"
 * formatRelativeTime(Date.now() - 7200000) // "Há 2h"
 * formatRelativeTime(Date.now() - 259200000) // "Há 3 dias"
 * formatRelativeTime(Date.now() - 5184000000) // "Há 2 meses"
 * formatRelativeTime(Date.now() - 31536000000) // "Há 1 ano"
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Converter para unidades de tempo
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  // Retornar o maior período de tempo aplicável
  if (years > 0) {
    return years === 1 ? 'Há 1 ano' : `Há ${years} anos`;
  }

  if (months > 0) {
    return months === 1 ? 'Há 1 mês' : `Há ${months} meses`;
  }

  if (days > 0) {
    return days === 1 ? 'Há 1 dia' : `Há ${days} dias`;
  }

  if (hours > 0) {
    return `Há ${hours}h`;
  }

  if (minutes > 0) {
    return `Há ${minutes} min`;
  }

  if (seconds > 0) {
    return `Há ${seconds} seg`;
  }

  return 'Agora';
}

/**
 * Variantes de formatação de tempo relativo
 */

/**
 * Formata tempo relativo de forma mais detalhada
 * @example "há 2 horas e 30 minutos"
 */
export function formatRelativeTimeDetailed(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    if (remainingHours > 0) {
      return `Há ${days} dia${days > 1 ? 's' : ''} e ${remainingHours} hora${remainingHours > 1 ? 's' : ''}`;
    }
    return `Há ${days} dia${days > 1 ? 's' : ''}`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    if (remainingMinutes > 0) {
      return `Há ${hours} hora${hours > 1 ? 's' : ''} e ${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}`;
    }
    return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    if (remainingSeconds > 0 && minutes < 5) {
      return `Há ${minutes} minuto${minutes > 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds > 1 ? 's' : ''}`;
    }
    return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  }

  if (seconds > 0) {
    return `Há ${seconds} segundo${seconds > 1 ? 's' : ''}`;
  }

  return 'Agora mesmo';
}

/**
 * Formata tempo relativo de forma abreviada
 * @example "2h", "30m", "15s"
 */
export function formatRelativeTimeShort(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}a`;
  if (months > 0) return `${months}m`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  if (seconds > 0) return `${seconds}s`;

  return 'agora';
}
