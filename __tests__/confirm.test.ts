import { Alert, type AlertButton } from 'react-native';

import { confirmDelete } from '../utils/confirm';

test('pide confirmación con "Cancelar" y "Eliminar"', () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const onConfirm = jest.fn();

  confirmDelete('Leer módulo 2', onConfirm);

  expect(alert).toHaveBeenCalledTimes(1);
  const [titulo, mensaje, botones] = alert.mock.calls[0];
  expect(titulo).toBe('Eliminar tarea');
  expect(mensaje).toContain('Leer módulo 2');
  expect((botones as AlertButton[]).map((b) => b.text)).toEqual(['Cancelar', 'Eliminar']);

  // "Cancelar" no hace nada; solo "Eliminar" confirma.
  expect((botones as AlertButton[])[0].onPress).toBeUndefined();
  expect(onConfirm).not.toHaveBeenCalled();
  (botones as AlertButton[])[1].onPress?.();
  expect(onConfirm).toHaveBeenCalledTimes(1);
});
