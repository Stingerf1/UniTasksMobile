/**
 * Tipos del dominio de UniTasks.
 */

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
