// Dobles de prueba (test doubles) para los módulos nativos que no existen en Jest.

// AsyncStorage: simulación en memoria que trae la propia librería.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Safe area: medidas fijas de pantalla, sin muesca.
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
