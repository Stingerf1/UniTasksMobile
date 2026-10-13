import { Alert } from 'react-native';

/**
 * Pide confirmación antes de borrar una tarea.
 * Solo llama a `onConfirm` si el usuario toca "Eliminar".
 */
export function confirmDelete(title: string, onConfirm: () => void): void {
  Alert.alert('Eliminar tarea', `¿Seguro que quieres eliminar "${title}"?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}
