import { useColorScheme } from 'react-native';

import type { Priority } from '../types/task';

/** Colores que usa la app. Hay una versión clara y una oscura. */
export interface Palette {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  onPrimary: string;
  danger: string;
  placeholder: string;
  /** Color de cada prioridad (insignia y selector). */
  priority: Record<Priority, string>;
}

export const lightColors: Palette = {
  background: '#F6F5FA',
  surface: '#FFFFFF',
  text: '#1C1A24',
  textMuted: '#6B6878',
  border: '#E2E0EA',
  primary: '#6D28D9',
  onPrimary: '#FFFFFF',
  danger: '#B42318',
  placeholder: '#8E8B9A',
  priority: { alta: '#B42318', media: '#B54708', baja: '#027A48' },
};

export const darkColors: Palette = {
  background: '#121117',
  surface: '#1D1B24',
  text: '#F2F1F6',
  textMuted: '#A9A6B6',
  border: '#2E2B38',
  primary: '#A78BFA',
  onPrimary: '#1C1033',
  danger: '#F97066',
  placeholder: '#7D7A8A',
  priority: { alta: '#F97066', media: '#FDB022', baja: '#32D583' },
};

/** Devuelve la paleta según el tema del teléfono (claro u oscuro). */
export function useThemeColors(): Palette {
  return useColorScheme() === 'dark' ? darkColors : lightColors;
}

/** Tamaño mínimo de cualquier área táctil (regla de CLAUDE.md). */
export const MIN_TOUCH = 48;
