/**
 * Prueba del componente TaskInput aislado, con un onSubmit simulado (mock).
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { TaskInput } from '../components/TaskInput';
import { lightColors } from '../theme/colors';

test('bloqueado (mientras carga) no envía nada', async () => {
  const onSubmit = jest.fn();
  await render(<TaskInput onSubmit={onSubmit} disabled colors={lightColors} />);

  await fireEvent.changeText(screen.getByLabelText('Título de la tarea'), 'Algo');
  await fireEvent(screen.getByLabelText('Título de la tarea'), 'submitEditing');

  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Agregar tarea' })).toBeDisabled();
});

test('sin la prop disabled, envía el texto escrito tal cual', async () => {
  const onSubmit = jest.fn().mockReturnValue({ ok: true, value: 'Algo' });
  await render(<TaskInput onSubmit={onSubmit} colors={lightColors} />);

  await fireEvent.changeText(screen.getByLabelText('Título de la tarea'), '  Algo ');
  await fireEvent.press(screen.getByRole('button', { name: 'Agregar tarea' }));

  expect(onSubmit).toHaveBeenCalledWith('  Algo ');
  expect(screen.getByLabelText('Título de la tarea')).toHaveDisplayValue('');
});
