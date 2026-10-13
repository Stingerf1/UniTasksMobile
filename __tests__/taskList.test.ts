/**
 * Pruebas unitarias de las funciones puras de la lista.
 * Incluye transición de estados: Pendiente ⇄ Completada → Eliminada.
 */
import type { Task } from '../types/task';
import {
  addTask,
  countTasks,
  createTask,
  formatCounts,
  isPriority,
  makeId,
  parseStoredTasks,
  removeTask,
  toggleTask,
} from '../utils/taskList';

const tarea = (id: string, done = false): Task => ({
  id,
  title: `Tarea ${id}`,
  done,
  createdAt: 1,
  priority: 'media',
});

describe('createTask y makeId', () => {
  test('crea una tarea pendiente con la fecha indicada', () => {
    const t = createTask('Comprar café', 1_700_000_000_000);
    expect(t).toMatchObject({ title: 'Comprar café', done: false, createdAt: 1_700_000_000_000 });
    expect(typeof t.id).toBe('string');
  });

  test('makeId sin argumentos usa la hora actual', () => {
    expect(makeId()).toMatch(/^[a-z0-9]+-[a-z0-9]+$/);
  });

  test('dos ids creados en el mismo milisegundo son distintos', () => {
    const ids = new Set(Array.from({ length: 50 }, () => makeId(123)));
    expect(ids.size).toBe(50);
  });
});

describe('addTask', () => {
  test('agrega la tarea nueva al inicio', () => {
    const lista = [tarea('1')];
    expect(addTask(lista, tarea('2')).map((t) => t.id)).toEqual(['2', '1']);
  });

  test('no modifica la lista original', () => {
    const lista = [tarea('1')];
    addTask(lista, tarea('2'));
    expect(lista).toHaveLength(1);
  });
});

describe('transición de estados', () => {
  test('TE-1: Pendiente → Completada', () => {
    expect(toggleTask([tarea('1')], '1')[0].done).toBe(true);
  });

  test('TE-2: Completada → Pendiente', () => {
    expect(toggleTask([tarea('1', true)], '1')[0].done).toBe(false);
  });

  test('TE-3: cualquier estado → Eliminada', () => {
    const lista = [tarea('1'), tarea('2', true)];
    expect(removeTask(lista, '2').map((t) => t.id)).toEqual(['1']);
    expect(removeTask(lista, '1').map((t) => t.id)).toEqual(['2']);
  });

  test('TE-4 (inválida): marcar un id que no existe no cambia nada', () => {
    const lista = [tarea('1')];
    expect(toggleTask(lista, 'x')).toEqual(lista);
  });

  test('TE-5 (inválida): eliminar un id que no existe no cambia nada', () => {
    const lista = [tarea('1')];
    expect(removeTask(lista, 'x')).toEqual(lista);
  });

  test('solo cambia la tarea indicada', () => {
    const lista = [tarea('1'), tarea('2')];
    const nueva = toggleTask(lista, '2');
    expect(nueva[0]).toBe(lista[0]);
    expect(nueva[1].done).toBe(true);
  });
});

describe('countTasks y formatCounts', () => {
  test('cuenta pendientes y completadas', () => {
    expect(countTasks([tarea('1'), tarea('2', true), tarea('3', true)])).toEqual({ pending: 1, done: 2 });
  });

  test.each([
    [0, 0, '0 pendientes · 0 completadas'],
    [1, 1, '1 pendiente · 1 completada'],
    [2, 3, '2 pendientes · 3 completadas'],
  ])('pendientes=%i, completadas=%i → "%s"', (pending, done, texto) => {
    expect(formatCounts({ pending, done })).toBe(texto);
  });
});

describe('parseStoredTasks (datos guardados en el teléfono)', () => {
  test('sin datos guardados → lista vacía', () => {
    expect(parseStoredTasks(null)).toEqual([]);
    expect(parseStoredTasks('')).toEqual([]);
  });

  test('JSON dañado → lista vacía, sin cerrar la app', () => {
    expect(parseStoredTasks('{esto no es json')).toEqual([]);
  });

  test('JSON que no es una lista → lista vacía', () => {
    expect(parseStoredTasks('{"id":"1"}')).toEqual([]);
  });

  test('descarta elementos que no tienen forma de tarea', () => {
    const json = JSON.stringify([tarea('1'), null, 5, { id: '2', title: 'sin done' }, tarea('3', true)]);
    expect(parseStoredTasks(json).map((t) => t.id)).toEqual(['1', '3']);
  });
});

describe('prioridad (feature/prioridad)', () => {
  test('sin indicar prioridad, la tarea nueva queda en "media"', () => {
    expect(createTask('Algo', 1).priority).toBe('media');
  });

  test('respeta la prioridad elegida', () => {
    expect(createTask('Algo', 1, 'alta').priority).toBe('alta');
  });

  test.each([
    ['alta', true],
    ['media', true],
    ['baja', true],
    ['urgente', false],
    [3, false],
    [undefined, false],
  ])('isPriority(%p) → %s', (valor, esperado) => {
    expect(isPriority(valor)).toBe(esperado);
  });

  test('compatibilidad: tareas guardadas por la versión anterior (sin prioridad) pasan a "media"', () => {
    const vieja = { id: '1', title: 'De la v1', done: false, createdAt: 1 };
    expect(parseStoredTasks(JSON.stringify([vieja]))).toEqual([{ ...vieja, priority: 'media' }]);
  });

  test('una prioridad desconocida se corrige a "media"', () => {
    const rara = { id: '1', title: 'Rara', done: false, createdAt: 1, priority: 'urgente' };
    expect(parseStoredTasks(JSON.stringify([rara]))[0].priority).toBe('media');
  });

  test('una prioridad válida guardada se conserva', () => {
    const baja = { ...tarea('1'), priority: 'baja' };
    expect(parseStoredTasks(JSON.stringify([baja]))[0].priority).toBe('baja');
  });
});
