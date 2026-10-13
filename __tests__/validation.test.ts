/**
 * Pruebas unitarias de validateTitle (RF-01).
 * Técnicas de caja negra del Módulo II: clases de equivalencia y valor límite.
 */
import { TITLE_ERRORS, TITLE_MAX_LENGTH, countChars, validateTitle } from '../utils/validation';

const letras = (n: number) => 'a'.repeat(n);

describe('validateTitle · clases de equivalencia', () => {
  test('CE-1 inválida: texto vacío → rechazado', () => {
    expect(validateTitle('')).toEqual({ ok: false, error: TITLE_ERRORS.empty });
  });

  test('CE-1 inválida: solo espacios → rechazado', () => {
    expect(validateTitle('    ')).toEqual({ ok: false, error: TITLE_ERRORS.empty });
  });

  test('CE-2 válida: título normal (1 a 100) → aceptado', () => {
    expect(validateTitle('Estudiar para el parcial')).toEqual({
      ok: true,
      value: 'Estudiar para el parcial',
    });
  });

  test('CE-3 inválida: más de 100 caracteres → rechazado', () => {
    expect(validateTitle(letras(150))).toEqual({ ok: false, error: TITLE_ERRORS.tooLong });
  });
});

describe('validateTitle · valores límite', () => {
  test.each([
    ['VL-1', 0, false],
    ['VL-2', 1, true],
    ['VL-3', TITLE_MAX_LENGTH, true],
    ['VL-4', TITLE_MAX_LENGTH + 1, false],
  ])('%s: %i caracteres → aceptado = %s', (_id, n, aceptado) => {
    expect(validateTitle(letras(n)).ok).toBe(aceptado);
  });
});

describe('validateTitle · espacios y caracteres especiales', () => {
  test('quita los espacios de los lados antes de guardar', () => {
    expect(validateTitle('   Leer capítulo 3  ')).toEqual({ ok: true, value: 'Leer capítulo 3' });
  });

  test('los espacios de los lados no cuentan para el límite', () => {
    expect(validateTitle(`  ${letras(TITLE_MAX_LENGTH)}  `).ok).toBe(true);
  });

  test('un emoji cuenta como 1 carácter: 100 emojis se aceptan', () => {
    const cien = '📚'.repeat(100);
    expect(cien.length).toBe(200); // lo que diría string.length
    expect(countChars(cien)).toBe(100);
    expect(validateTitle(cien).ok).toBe(true);
  });

  test('101 emojis se rechazan', () => {
    expect(validateTitle('📚'.repeat(101))).toEqual({ ok: false, error: TITLE_ERRORS.tooLong });
  });
});
