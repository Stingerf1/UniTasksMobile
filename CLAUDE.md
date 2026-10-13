# Directrices de desarrollo — UniTasks Mobile (Cross-Platform)

@AGENTS.md

## Stack y herramientas

- Framework: React Native con **Expo SDK 57** (`expo` ~57). Antes de usar una API de Expo, revisa la documentación de esa versión (ver AGENTS.md).
- Lenguaje: TypeScript estricto (`"strict": true`).
- Estilos: `StyleSheet` de React Native. Los colores salen solo de `theme/colors.ts`.
- Almacenamiento: `@react-native-async-storage/async-storage`, usado **solo** dentro de `hooks/useTasks.ts`.
- Pruebas: Jest (`jest-expo`) + React Native Testing Library v14.
- Una sola pantalla: este proyecto **no usa Expo Router**. Ignora esa sección de AGENTS.md mientras haya una sola pantalla.

## Estructura

```
types/       tipos del dominio (Task, TitleValidation)
utils/       lógica pura: validación, lista de tareas, confirmación
hooks/       useTasks: estado + persistencia
components/  TaskInput, TaskItem (solo muestran y avisan)
screens/     TaskScreen
theme/       paletas clara/oscura y MIN_TOUCH
__tests__/   pruebas unitarias y de integración
```

## Principios de diseño móvil

- Respetar la Safe Area con `react-native-safe-area-context` (no el `SafeAreaView` de react-native).
- Áreas táctiles mínimas de 48×48 (`MIN_TOUCH`).
- Teclado: `KeyboardAvoidingView` con `behavior="padding"` en iOS y `undefined` en Android.
- Tema claro y oscuro con `useThemeColors()`.
- Todo control tocable lleva `accessibilityRole` y `accessibilityLabel`.

## Reglas operativas del agente

- La lógica va en funciones puras (`utils/`) y en custom hooks (`hooks/`). Los componentes no tocan el almacenamiento.
- Valida los tipos de todas las props con interfaces de TypeScript.
- Instala paquetes con `npx expo install <paquete>`, nunca con `npm install <paquete>` directo.
- Usa solo librerías incluidas en Expo Go. Si una librería necesita un build nativo, pregunta antes.
- No ejecutes `npx expo prebuild` ni crees `android/` o `ios/` a menos que se pida explícitamente.
- Modelos: Sonnet 5.5 para desarrollo activo; Opus 5.5 para revisión de arquitectura.

## Pruebas (obligatorio)

- Todo cambio de lógica trae su prueba en `__tests__/`.
- Para validaciones, diseña los casos con **clases de equivalencia** y **valor límite**, y nómbralos (`CE-x`, `VL-x`).
- RNTL v14 es asíncrono: `await render(...)`, `await renderHook(...)`, `await fireEvent...`. Prefiere `userEvent` y `getByRole`.
- Antes de dar una tarea por terminada corre `npm run typecheck` y `npm run test:coverage` (mínimo 90% de líneas y 85% de ramas).

## Puntos de control humano (pide aprobación antes de…)

- Instalar, quitar o actualizar dependencias.
- Cambiar la forma de los datos guardados (`types/task.ts` o la clave de AsyncStorage). La app debe seguir leyendo los datos viejos.
- Borrar archivos o pruebas.
- Hacer `git commit` o `git push`: muestra primero el diff y el mensaje propuesto.

## Git

- Conventional Commits en español: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`.
- Una rama por funcionalidad: `feature/<nombre>`.
