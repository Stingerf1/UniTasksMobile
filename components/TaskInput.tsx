import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MIN_TOUCH, type Palette } from '../theme/colors';
import { DEFAULT_PRIORITY, type Priority, type TitleValidation } from '../types/task';
import { countChars, TITLE_MAX_LENGTH } from '../utils/validation';
import { PrioritySelector } from './PrioritySelector';

export interface TaskInputProps {
  /** Recibe el texto escrito y la prioridad elegida, y responde si se pudo agregar. */
  onSubmit: (title: string, priority: Priority) => TitleValidation;
  /** Bloquea el campo (por ejemplo, mientras cargan las tareas). */
  disabled?: boolean;
  colors: Palette;
}

/** Campo de texto y botón "Agregar". Muestra el error de validación si lo hay. */
export function TaskInput({ onSubmit, disabled = false, colors }: TaskInputProps) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);

  const length = countChars(text.trim());
  const overLimit = length > TITLE_MAX_LENGTH;

  function handleSubmit() {
    if (disabled) return;
    const result = onSubmit(text, priority);
    if (result.ok) {
      setText('');
      setError(null);
      setPriority(DEFAULT_PRIORITY);
    } else {
      setError(result.error);
    }
  }

  function handleChange(value: string) {
    setText(value);
    if (error) setError(null);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {error ? (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={[styles.error, { color: colors.danger }]}
        >
          {error}
        </Text>
      ) : null}

      <PrioritySelector value={priority} onChange={setPriority} disabled={disabled} colors={colors} />

      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={handleChange}
          onSubmitEditing={handleSubmit}
          placeholder="Nueva tarea…"
          placeholderTextColor={colors.placeholder}
          accessibilityLabel="Título de la tarea"
          editable={!disabled}
          returnKeyType="done"
          submitBehavior="submit"
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: error ? colors.danger : colors.border,
            },
          ]}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Agregar tarea"
          accessibilityState={{ disabled }}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: colors.primary, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>Agregar</Text>
        </Pressable>
      </View>

      <Text style={[styles.counter, { color: overLimit ? colors.danger : colors.textMuted }]}>
        {length}/{TITLE_MAX_LENGTH}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    minWidth: 0, // deja que el campo se encoja y el botón nunca se salga de la pantalla
    minHeight: MIN_TOUCH,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  button: {
    flexShrink: 0,
    minHeight: MIN_TOUCH,
    minWidth: MIN_TOUCH,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    fontSize: 14,
    marginBottom: 6,
  },
  counter: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});
