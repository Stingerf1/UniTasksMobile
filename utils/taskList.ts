import type { Task, TaskCounts } from '../types/task';

/**
 * Funciones puras para manejar la lista de tareas.
 * No tocan el almacenamiento ni la interfaz, así que se prueban sin simulaciones.
 * Ninguna modifica la lista original: siempre devuelven una lista nueva.
 */

/** Genera un id corto y único a partir de la hora y un sufijo aleatorio. */
export function makeId(now: number = Date.now()): string {
  return `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Crea una tarea nueva y pendiente. El título debe venir ya validado. */
export function createTask(title: string, now: number = Date.now()): Task {
  return { id: makeId(now), title, done: false, createdAt: now };
}

/** Agrega la tarea al inicio de la lista (la más nueva arriba). */
export function addTask(list: Task[], task: Task): Task[] {
  return [task, ...list];
}

/** Cambia una tarea de pendiente a completada o al revés. */
export function toggleTask(list: Task[], id: string): Task[] {
  return list.map((task) => (task.id === id ? { ...task, done: !task.done } : task));
}

/** Quita una tarea de la lista. Si el id no existe, la lista queda igual. */
export function removeTask(list: Task[], id: string): Task[] {
  return list.filter((task) => task.id !== id);
}

/** Cuenta pendientes y completadas. */
export function countTasks(list: Task[]): TaskCounts {
  const done = list.filter((task) => task.done).length;
  return { pending: list.length - done, done };
}

/** Texto del encabezado, con singular y plural correctos. */
export function formatCounts({ pending, done }: TaskCounts): string {
  const p = pending === 1 ? '1 pendiente' : `${pending} pendientes`;
  const d = done === 1 ? '1 completada' : `${done} completadas`;
  return `${p} · ${d}`;
}

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.title === 'string' &&
    typeof t.done === 'boolean' &&
    typeof t.createdAt === 'number'
  );
}

/**
 * Lee lo que había guardado en el teléfono.
 * Si no hay nada, el JSON está dañado o no es una lista, devuelve una lista vacía
 * en vez de cerrar la app. Descarta los elementos que no tengan forma de tarea.
 */
export function parseStoredTasks(json: string | null): Task[] {
  if (!json) return [];
  try {
    const data: unknown = JSON.parse(json);
    return Array.isArray(data) ? data.filter(isTask) : [];
  } catch {
    return [];
  }
}
