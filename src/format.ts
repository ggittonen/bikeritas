export const formatTime = (timestamp: number, locale: string) =>
  new Date(timestamp).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatPercent = (value: number) => `${Math.round(value)} %`;
