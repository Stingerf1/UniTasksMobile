import { DEFAULT_PRIORITY, PRIORITIES, type Priority, type Task, type TaskCounts } from '../types/task';

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
export function createTask(
  title: string,
  now: number = Date.now(),
  priority: Priority = DEFAULT_PRIORITY,
): Task {
  return { id: makeId(now), title, done: false, createdAt: now, priority };
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

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

/**
 * Convierte un elemento guardado en una tarea válida, o `null` si no sirve.
 * Las tareas guardadas por la versión anterior no tienen prioridad: se les pone "media"
 * para que la actualización no borre los datos del usuario.
 */
function toTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null;
  const t = value as Record<string, unknown>;
  if (
    typeof t.id !== 'string' ||
    typeof t.title !== 'string' ||
    typeof t.done !== 'boolean' ||
    typeof t.createdAt !== 'number'
  ) {
    return null;
  }
  return {
    id: t.id,
    title: t.title,
    done: t.done,
    createdAt: t.createdAt,
    priority: isPriority(t.priority) ? t.priority : DEFAULT_PRIORITY,
  };
}

/**
 * Lee lo que había guardado en el teléfono.
 * Si no hay nada, el JSON está dañado o no es una lista, devuelve una lista vacía
 * en vez de cerrar la app. Descarta los elementos que no tengan forma de tarea
 * y completa la prioridad de las tareas viejas.
 */
export function parseStoredTasks(json: string | null): Task[] {
  if (!json) return [];
  try {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) return [];
    return data.map(toTask).filter((task): task is Task => task !== null);
  } catch {
    return [];
  }
}
