import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MIN_TOUCH, type Palette } from '../theme/colors';
import { PRIORITIES, type Priority } from '../types/task';

export const PRIORITY_LABELS: Record<Priority, string> = {
  alta: 'Alta',
  media: 'Media',
  baja: 'Baja',
};

export interface PrioritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  disabled?: boolean;
  colors: Palette;
}

/** Tres botones (Alta, Media, Baja); solo uno queda seleccionado. */
export function PrioritySelector({ value, onChange, disabled = false, colors }: PrioritySelectorProps) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Prioridad" style={styles.row}>
      {PRIORITIES.map((priority) => {
        const selected = priority === value;
        const tint = colors.priority[priority];
        return (
          <Pressable
            key={priority}
            onPress={() => onChange(priority)}
            disabled={disabled}
            accessibilityRole="radio"
            accessibilityLabel={`Prioridad ${PRIORITY_LABELS[priority].toLowerCase()}`}
            accessibilityState={{ selected, disabled }}
            style={[
              styles.chip,
              {
                borderColor: tint,
                backgroundColor: selected ? tint : 'transparent',
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.surface : tint }]}>
              {PRIORITY_LABELS[priority]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flex: 1,
    minHeight: MIN_TOUCH,
    borderWidth: 1.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
