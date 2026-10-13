/**
 * Pruebas del hook useTasks (unidad bajo prueba: SUT).
 * AsyncStorage es el componente del que depende (DOC) y se reemplaza por
 * un doble de prueba en memoria (ver jest.setup.ts).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { STORAGE_ERRORS, STORAGE_KEY, useTasks } from '../hooks/useTasks';
import type { Task } from '../types/task';
import { TITLE_ERRORS } from '../utils/validation';

const guardado = async (): Promise<Task[]> => JSON.parse((await AsyncStorage.getItem(STORAGE_KEY)) ?? '[]');

async function renderCargado() {
  const hook = await renderHook(() => useTasks());
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  return hook;
}

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks(); // borra las llamadas registradas por el doble de AsyncStorage
  await AsyncStorage.clear();
});

test('al abrir, carga las tareas guardadas', async () => {
  const previa: Task = { id: 'a', title: 'Tarea guardada', done: true, createdAt: 1, priority: 'alta' };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([previa]));

  const { result } = await renderCargado();

  expect(result.current.tasks).toEqual([previa]);
  expect(result.current.counts).toEqual({ pending: 0, done: 1 });
});

test('agregar un título válido lo guarda en el teléfono', async () => {
  const { result } = await renderCargado();

  let respuesta;
  await act(async () => {
    respuesta = result.current.addTask('  Repasar casos de prueba ');
  });

  expect(respuesta).toEqual({ ok: true, value: 'Repasar casos de prueba' });
  expect(result.current.tasks[0].title).toBe('Repasar casos de prueba');
  await waitFor(async () => expect(await guardado()).toHaveLength(1));
});

test('un título inválido no se agrega ni se guarda', async () => {
  const { result } = await renderCargado();
  const setItem = jest.spyOn(AsyncStorage, 'setItem');

  let respuesta;
  await act(async () => {
    respuesta = result.current.addTask('   ');
  });

  expect(respuesta).toEqual({ ok: false, error: TITLE_ERRORS.empty });
  expect(result.current.tasks).toEqual([]);
  expect(setItem).not.toHaveBeenCalled();
});

test('dos tareas agregadas seguidas se conservan las dos', async () => {
  const { result } = await renderCargado();

  await act(async () => {
    result.current.addTask('Primera');
    result.current.addTask('Segunda');
  });

  expect(result.current.tasks.map((t) => t.title)).toEqual(['Segunda', 'Primera']);
  await waitFor(async () => expect(await guardado()).toHaveLength(2));
});

test('marcar y eliminar también se guardan', async () => {
  const { result } = await renderCargado();
  await act(async () => {
    result.current.addTask('Entregar laboratorio');
  });
  const id = result.current.tasks[0].id;

  await act(async () => result.current.toggleTask(id));
  expect(result.current.tasks[0].done).toBe(true);
  await waitFor(async () => expect((await guardado())[0].done).toBe(true));

  await act(async () => result.current.removeTask(id));
  expect(result.current.tasks).toEqual([]);
  await waitFor(async () => expect(await guardado()).toEqual([]));
});

test('si falla la lectura, avisa y deja la lista vacía', async () => {
  jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('disco'));

  const { result } = await renderCargado();

  expect(result.current.tasks).toEqual([]);
  expect(result.current.storageError).toBe(STORAGE_ERRORS.load);
});

test('si falla el guardado, avisa al usuario', async () => {
  const { result } = await renderCargado();
  jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('lleno'));

  await act(async () => {
    result.current.addTask('No se va a guardar');
  });

  await waitFor(() => expect(result.current.storageError).toBe(STORAGE_ERRORS.save));
});

test('si la pantalla se cierra antes de terminar de cargar, no actualiza nada', async () => {
  let terminarCarga: (valor: string | null) => void = () => {};
  jest
    .spyOn(AsyncStorage, 'getItem')
    .mockImplementationOnce(() => new Promise((resolve) => (terminarCarga = resolve)));

  const { result, unmount } = await renderHook(() => useTasks());
  expect(result.current.loading).toBe(true);
  await unmount();

  await act(async () => terminarCarga('[]'));
  expect(result.current.loading).toBe(true);
});

test('si la pantalla se cierra y la lectura falla después, tampoco actualiza nada', async () => {
  let fallarCarga: (error: Error) => void = () => {};
  jest
    .spyOn(AsyncStorage, 'getItem')
    .mockImplementationOnce(() => new Promise((_resolve, reject) => (fallarCarga = reject)));

  const { result, unmount } = await renderHook(() => useTasks());
  await unmount();

  await act(async () => fallarCarga(new Error('tarde')));
  expect(result.current.storageError).toBeNull();
});

test('agregar con prioridad la guarda junto con la tarea', async () => {
  const { result } = await renderCargado();

  await act(async () => {
    result.current.addTask('Parcial de redes', 'alta');
  });

  expect(result.current.tasks[0].priority).toBe('alta');
  await waitFor(async () => expect((await guardado())[0].priority).toBe('alta'));
});
