import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TaskScreen } from './screens/TaskScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TaskScreen />
    </SafeAreaProvider>
  );
}
