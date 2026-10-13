import { StatusBar } from 'expo-status-bar';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TaskInput } from '../components/TaskInput';
import { TaskItem } from '../components/TaskItem';
import { useTasks } from '../hooks/useTasks';
import { useThemeColors } from '../theme/colors';
import type { Task } from '../types/task';
import { formatCounts } from '../utils/taskList';

/** Pantalla principal: encabezado, lista de tareas y campo para agregar. */
export function TaskScreen() {
  const colors = useThemeColors();
  const { tasks, counts, loading, storageError, addTask, toggleTask, removeTask } = useTasks();

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem task={item} onToggle={toggleTask} onDelete={removeTask} colors={colors} />
    ),
    [toggleTask, removeTask, colors],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        style={styles.flex}
        // iOS necesita "padding"; en Android el sistema ya redimensiona la ventana.
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
            UniTasks
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{formatCounts(counts)}</Text>
        </View>

        {storageError ? (
          <Text accessibilityRole="alert" style={[styles.banner, { color: colors.danger }]}>
            {storageError}
          </Text>
        ) : null}

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando tareas" />
          </View>
        ) : (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={Separator}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.textMuted }]}>
                No tienes tareas. ¡Agrega la primera!
              </Text>
            }
          />
        )}

        <TaskInput onSubmit={addTask} disabled={loading} colors={colors} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  banner: {
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: { height: 10 },
  empty: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
  },
});
