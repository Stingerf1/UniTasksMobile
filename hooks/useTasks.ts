import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { Priority, Task, TaskCounts, TitleValidation } from '../types/task';
import {
  addTask as addToList,
  countTasks,
  createTask,
  parseStoredTasks,
  removeTask as removeFromList,
  toggleTask as toggleInList,
} from '../utils/taskList';
import { validateTitle } from '../utils/validation';

/** Clave donde se guardan las tareas en el teléfono. */
export const STORAGE_KEY = '@unitasks/tasks';

export const STORAGE_ERRORS = {
  load: 'No se pudieron cargar tus tareas guardadas.',
  save: 'No se pudo guardar el último cambio.',
} as const;

export interface UseTasksResult {
  tasks: Task[];
  counts: TaskCounts;
  /** `true` mientras se leen las tareas guardadas al abrir la app. */
  loading: boolean;
  /** Mensaje si falló leer o guardar; `null` si todo va bien. */
  storageError: string | null;
  addTask: (title: string, priority?: Priority) => TitleValidation;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
}

/**
 * Capa de datos de la app: guarda la lista en memoria y la persiste con AsyncStorage.
 * La pantalla no sabe nada del almacenamiento; solo llama a estas funciones.
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Copia síncrona de la lista para que dos cambios seguidos no se pisen.
  const tasksRef = useRef<Task[]>([]);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((json) => {
        if (!active) return;
        const saved = parseStoredTasks(json);
        tasksRef.current = saved;
        setTasks(saved);
      })
      .catch(() => {
        if (active) setStorageError(STORAGE_ERRORS.load);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  /** Aplica un cambio a la lista y lo guarda en el teléfono. */
  const commit = useCallback((next: Task[]) => {
    tasksRef.current = next;
    setTasks(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      .then(() => setStorageError(null))
      .catch(() => setStorageError(STORAGE_ERRORS.save));
  }, []);

  const addTask = useCallback(
    (title: string, priority?: Priority): TitleValidation => {
      const result = validateTitle(title);
      if (result.ok) {
        commit(addToList(tasksRef.current, createTask(result.value, Date.now(), priority)));
      }
      return result;
    },
    [commit],
  );

  const toggleTask = useCallback(
    (id: string) => commit(toggleInList(tasksRef.current, id)),
    [commit],
  );

  const removeTask = useCallback(
    (id: string) => commit(removeFromList(tasksRef.current, id)),
    [commit],
  );

  const counts = useMemo(() => countTasks(tasks), [tasks]);

  return { tasks, counts, loading, storageError, addTask, toggleTask, removeTask };
}
