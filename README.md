# UniTasks Mobile

Lista de tareas para estudiantes, hecha con **React Native + Expo (SDK 57)** y TypeScript.
Funciona en Android e iOS desde un solo código y se prueba en el celular con **Expo Go**.

Caso práctico del Laboratorio #1 — *Codificación asistida por IA* (Pruebas y Mantenimiento de Software, UTP).

## Qué hace

- Agregar tareas (título de 1 a 100 caracteres; se quitan los espacios de los lados).
- Tocar una tarea para marcarla o desmarcarla.
- Mantener presionada una tarea para eliminarla (pide confirmación).
- Guarda todo en el teléfono: al cerrar y abrir la app, las tareas siguen ahí.
- Modo claro y oscuro según el tema del teléfono.

## Requisitos

- **Node.js** 20.19.4 o más nuevo (recomendado: la versión LTS).
- **Expo Go** en el celular (Play Store / App Store).
- Celular y computadora en la misma red Wi-Fi (o usar el modo túnel, ver abajo).

## Correr la app

```bash
npm install
npx expo start
```

Escanea el código QR que sale en la terminal:

- **Android:** desde la app Expo Go.
- **iPhone:** con la cámara del teléfono.

### Si el celular no conecta (Wi-Fi de la universidad)

Muchas redes no dejan que los dispositivos se vean entre sí. Usa el modo túnel:

```bash
npm run start:tunnel
```

La primera vez pide instalar `@expo/ngrok`; acepta. Necesita internet.

### Si Expo Go dice que el proyecto es de otra versión del SDK

Expo Go solo abre proyectos de la versión más reciente del SDK. Si salió una versión nueva, actualiza el proyecto:

```bash
npx expo install expo@latest --fix
```

## Pruebas

```bash
npm test               # corre todas las pruebas
npm run test:coverage  # pruebas + reporte de cobertura (abre coverage/index.html)
npm run typecheck      # revisa los tipos de TypeScript
```

| Archivo | Qué prueba | Tipo |
| --- | --- | --- |
| `validation.test.ts` | Título: clases de equivalencia y valores límite (0, 1, 100, 101) | Unitaria, caja negra |
| `taskList.test.ts` | Agregar, marcar, eliminar; transición de estados; datos guardados dañados | Unitaria, caja blanca |
| `useTasks.test.tsx` | Hook con AsyncStorage simulado; fallos de lectura/guardado | Unitaria con dobles de prueba |
| `TaskInput.test.tsx` | Campo de texto bloqueado y desbloqueado | Componente |
| `confirm.test.ts` | Diálogo de confirmación al eliminar | Unitaria con mock |
| `theme.test.ts` | Paleta clara y oscura | Unitaria |
| `App.test.tsx` | Flujos completos como los haría un usuario | Integración |

## Estructura

```
App.tsx              punto de entrada (SafeAreaProvider + pantalla)
screens/TaskScreen   pantalla principal
components/          TaskInput, TaskItem
hooks/useTasks.ts    estado + persistencia con AsyncStorage
utils/               validación, lógica de la lista, confirmación
types/task.ts        tipos
theme/colors.ts      colores claro/oscuro
__tests__/           pruebas
CLAUDE.md            reglas para el agente de IA
AGENTS.md            reglas generales de Expo para agentes (vienen con la plantilla)
```

## Ramas

- `main`: la app base.
- `feature/prioridad`: selector de prioridad (alta, media, baja). Es la funcionalidad que se implementa en vivo durante la demo; esta rama es el respaldo ya terminado.
