import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, type Palette } from '../theme/colors';
import type { Task } from '../types/task';
import { confirmDelete } from '../utils/confirm';
import { PRIORITY_LABELS } from './PrioritySelector';

export interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  colors: Palette;
}

/**
 * Una fila de la lista.
 * - Tocar: marca o desmarca la tarea.
 * - Mantener presionado: pide confirmación y la elimina.
 * Con lector de pantalla (TalkBack/VoiceOver) "Eliminar" aparece como acción.
 */
function TaskItemBase({ task, onToggle, onDelete, colors }: TaskItemProps) {
  const askDelete = () => confirmDelete(task.title, () => onDelete(task.id));

  return (
    <Pressable
      onPress={() => onToggle(task.id)}
      onLongPress={askDelete}
      delayLongPress={400}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.done }}
      accessibilityLabel={task.title}
      accessibilityValue={{ text: `Prioridad ${PRIORITY_LABELS[task.priority].toLowerCase()}` }}
      accessibilityHint="Toca para marcarla. Mantén presionado para eliminarla."
      accessibilityActions={[{ name: 'longpress', label: 'Eliminar' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'longpress') askDelete();
      }}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View
        style={[
          styles.check,
          {
            borderColor: colors.primary,
            backgroundColor: task.done ? colors.primary : 'transparent',
          },
        ]}
      >
        {task.done ? <Text style={[styles.checkMark, { color: colors.onPrimary }]}>✓</Text> : null}
      </View>
      <Text
        style={[
          styles.title,
          { color: task.done ? colors.textMuted : colors.text },
          task.done && styles.titleDone,
        ]}
      >
        {task.title}
      </Text>
      <View style={[styles.badge, { borderColor: colors.priority[task.priority] }]}>
        <Text style={[styles.badgeText, { color: colors.priority[task.priority] }]}>
          {PRIORITY_LABELS[task.priority]}
        </Text>
      </View>
    </Pressable>
  );
}

export const TaskItem = memo(TaskItemBase);

const styles = StyleSheet.create({
  row: {
    minHeight: MIN_TOUCH + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  badge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
