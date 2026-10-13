import { renderHook } from '@testing-library/react-native';

import { darkColors, lightColors, useThemeColors } from '../theme/colors';

const mockScheme = jest.fn();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockScheme(),
}));

test.each([
  ['dark', darkColors],
  ['light', lightColors],
  [null, lightColors],
])('tema del teléfono "%s" → paleta correcta', async (scheme, esperada) => {
  mockScheme.mockReturnValue(scheme);
  const { result } = await renderHook(() => useThemeColors());
  expect(result.current).toBe(esperada);
});
