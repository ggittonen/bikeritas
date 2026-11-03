export const formatTime = (timestamp: number) =>
  new Date(timestamp).toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const formatPercent = (value: number) => `${Math.round(value)} %`;
