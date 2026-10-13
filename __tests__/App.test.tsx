/**
 * Pruebas de integración de la pantalla completa: se usa la app como lo haría
 * una persona (escribir, tocar, mantener presionado) y se revisa lo que ve.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import App from '../App';
import { STORAGE_ERRORS, STORAGE_KEY } from '../hooks/useTasks';
import { TITLE_ERRORS } from '../utils/validation';

async function abrirApp() {
  await render(<App />);
  await screen.findByText(/pendientes?/);
}

function campo() {
  return screen.getByLabelText('Título de la tarea');
}

function botonAgregar() {
  return screen.getByRole('button', { name: 'Agregar tarea' });
}

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks(); // borra las llamadas registradas por el doble de AsyncStorage
  await AsyncStorage.clear();
});

test('sin tareas muestra el mensaje de lista vacía', async () => {
  await abrirApp();
  expect(screen.getByText('No tienes tareas. ¡Agrega la primera!')).toBeOnTheScreen();
  expect(screen.getByText('0 pendientes · 0 completadas')).toBeOnTheScreen();
});

test('agregar una tarea la muestra en la lista y limpia el campo', async () => {
  const user = userEvent.setup();
  await abrirApp();

  await user.type(campo(), 'Estudiar valor límite');
  await user.press(botonAgregar());

  expect(screen.getByRole('checkbox', { name: 'Estudiar valor límite' })).toBeOnTheScreen();
  expect(campo()).toHaveDisplayValue('');
  expect(screen.getByText('1 pendiente · 0 completadas')).toBeOnTheScreen();
});

test('también se agrega con la tecla "listo" del teclado', async () => {
  await abrirApp();

  await fireEvent.changeText(campo(), 'Desde el teclado');
  await fireEvent(campo(), 'submitEditing');

  expect(screen.getByRole('checkbox', { name: 'Desde el teclado' })).toBeOnTheScreen();
});

test('con el campo vacío muestra el error y no agrega nada', async () => {
  const user = userEvent.setup();
  await abrirApp();

  await user.press(botonAgregar());

  expect(screen.getByText(TITLE_ERRORS.empty)).toBeOnTheScreen();
  expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
});

test('el error desaparece al volver a escribir', async () => {
  const user = userEvent.setup();
  await abrirApp();

  await user.press(botonAgregar());
  await user.type(campo(), 'x');

  expect(screen.queryByText(TITLE_ERRORS.empty)).not.toBeOnTheScreen();
});

test('con 101 caracteres muestra el error de largo', async () => {
  await abrirApp();

  await fireEvent.changeText(campo(), 'a'.repeat(101));
  expect(screen.getByText('101/100')).toBeOnTheScreen();
  await fireEvent.press(botonAgregar());

  expect(screen.getByText(TITLE_ERRORS.tooLong)).toBeOnTheScreen();
});

test('tocar una tarea la marca como completada y otra vez la desmarca', async () => {
  const user = userEvent.setup();
  await abrirApp();
  await user.type(campo(), 'Hacer el informe');
  await user.press(botonAgregar());

  const fila = screen.getByRole('checkbox', { name: 'Hacer el informe' });
  await user.press(fila);
  expect(fila).toBeChecked();
  expect(screen.getByText('0 pendientes · 1 completada')).toBeOnTheScreen();

  await user.press(fila);
  expect(fila).not.toBeChecked();
});

test('mantener presionado y confirmar elimina la tarea', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const user = userEvent.setup();
  await abrirApp();
  await user.type(campo(), 'Tarea para borrar');
  await user.press(botonAgregar());

  await user.longPress(screen.getByRole('checkbox', { name: 'Tarea para borrar' }));
  expect(alert).toHaveBeenCalledTimes(1);

  // Antes de confirmar, la tarea sigue en la lista.
  expect(screen.getByRole('checkbox', { name: 'Tarea para borrar' })).toBeOnTheScreen();

  const botones = alert.mock.calls[0][2] as AlertButton[];
  await act(async () => botones[1].onPress?.());

  expect(await screen.findByText('No tienes tareas. ¡Agrega la primera!')).toBeOnTheScreen();
});

test('con lector de pantalla, la acción "Eliminar" también pide confirmación', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  const user = userEvent.setup();
  await abrirApp();
  await user.type(campo(), 'Accesible');
  await user.press(botonAgregar());

  const fila = screen.getByRole('checkbox', { name: 'Accesible' });
  await fireEvent(fila, 'accessibilityAction', { nativeEvent: { actionName: 'activate' } });
  expect(alert).not.toHaveBeenCalled();

  await fireEvent(fila, 'accessibilityAction', { nativeEvent: { actionName: 'longpress' } });
  expect(alert).toHaveBeenCalledTimes(1);
});

test('al volver a abrir la app aparecen las tareas guardadas', async () => {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([{ id: '1', title: 'Guardada ayer', done: false, createdAt: 1 }]),
  );

  await abrirApp();

  // Venía de la versión sin prioridad: se muestra como "Media".
  expect(screen.getByRole('checkbox', { name: 'Guardada ayer' })).toHaveTextContent(/Media/);
});

test('con varias tareas, la más nueva queda arriba', async () => {
  const user = userEvent.setup();
  await abrirApp();
  await user.type(campo(), 'Primera');
  await user.press(botonAgregar());
  await user.type(campo(), 'Segunda');
  await user.press(botonAgregar());

  const nombres = screen.getAllByRole('checkbox').map((fila) => fila.props.accessibilityLabel);
  expect(nombres).toEqual(['Segunda', 'Primera']);
  expect(screen.getByText('2 pendientes · 0 completadas')).toBeOnTheScreen();
});

test('si no se pueden leer las tareas guardadas, avisa en pantalla', async () => {
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disco'));

  await abrirApp();

  expect(screen.getByRole('alert')).toHaveTextContent(STORAGE_ERRORS.load);
});

test('elegir prioridad "Alta" la muestra en la tarea y el selector vuelve a "Media"', async () => {
  const user = userEvent.setup();
  await abrirApp();

  expect(screen.getByRole('radio', { name: 'Prioridad media' })).toBeSelected();
  await user.press(screen.getByRole('radio', { name: 'Prioridad alta' }));
  expect(screen.getByRole('radio', { name: 'Prioridad alta' })).toBeSelected();
  expect(screen.getByRole('radio', { name: 'Prioridad media' })).not.toBeSelected();

  await user.type(campo(), 'Parcial de redes');
  await user.press(botonAgregar());

  const fila = screen.getByRole('checkbox', { name: 'Parcial de redes' });
  expect(fila).toHaveTextContent(/Alta/);
  expect(screen.getByRole('radio', { name: 'Prioridad media' })).toBeSelected();
});
