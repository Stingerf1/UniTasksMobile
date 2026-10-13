import type { TitleValidation } from '../types/task';

/** Límites del título (requisito RF-01). */
export const TITLE_MIN_LENGTH = 1;
export const TITLE_MAX_LENGTH = 100;

export const TITLE_ERRORS = {
  empty: 'Escribe un título para la tarea.',
  tooLong: `El título no puede pasar de ${TITLE_MAX_LENGTH} caracteres.`,
} as const;

/**
 * Cuenta caracteres como los ve el usuario: un emoji cuenta como 1,
 * no como 2 (que es lo que daría `string.length`).
 */
export function countChars(text: string): number {
  return Array.from(text).length;
}

/**
 * Valida el título de una tarea (RF-01).
 *
 * - Se quitan los espacios al inicio y al final.
 * - El resultado debe tener entre 1 y 100 caracteres.
 *
 * Clases de equivalencia: vacío/solo espacios (inválida), 1–100 (válida), más de 100 (inválida).
 * Valores límite: 0, 1, 100 y 101 caracteres.
 */
export function validateTitle(raw: string): TitleValidation {
  const value = raw.trim();
  const length = countChars(value);

  if (length < TITLE_MIN_LENGTH) {
    return { ok: false, error: TITLE_ERRORS.empty };
  }
  if (length > TITLE_MAX_LENGTH) {
    return { ok: false, error: TITLE_ERRORS.tooLong };
  }
  return { ok: true, value };
}
