/**
 * Tipos del dominio de UniTasks.
 */

/** Prioridad de una tarea. */
export type Priority = 'alta' | 'media' | 'baja';

/** Orden en que se muestran las opciones. */
export const PRIORITIES: readonly Priority[] = ['alta', 'media', 'baja'];

/** Prioridad que se usa si no se elige otra (y para datos guardados antes de esta versión). */
export const DEFAULT_PRIORITY: Priority = 'media';

/** Una tarea de la lista. */
export interface Task {
  /** Identificador único (no cambia nunca). */
  id: string;
  /** Texto de la tarea, ya validado (1 a 100 caracteres, sin espacios a los lados). */
  title: string;
  /** `true` cuando la tarea está completada. */
  done: boolean;
  /** Fecha de creación en milisegundos (epoch). */
  createdAt: number;
  /** Prioridad elegida al crearla. */
  priority: Priority;
}

/** Resultado de validar un título: o el valor limpio, o el mensaje de error. */
export type TitleValidation =
  | { ok: true; value: string }
  | { ok: false; error: string };

/** Conteo de tareas para el encabezado. */
export interface TaskCounts {
  pending: number;
  done: number;
}
