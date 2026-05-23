export const colors = {
  primary: '#00754A',
  primaryDark: '#005236',
  secondary: '#FFC700',
  cheap: '#2ECC71',
  expensive: '#E74C3C',
  mid: '#F39C12',
  background: '#FFFFFF',
  surface: '#F5F7F6',
  border: '#E2E8E5',
  text: '#1A1A1A',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',
  white: '#FFFFFF',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};

export function priceColor(price: number, min: number, max: number): string {
  if (max <= min) {
    return colors.cheap;
  }
  const ratio = (price - min) / (max - min);
  if (ratio <= 0.33) {
    return colors.cheap;
  }
  if (ratio <= 0.66) {
    return colors.mid;
  }
  return colors.expensive;
}

export function formatPrice(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toFixed(1).replace('.', ',')} km`;
}
