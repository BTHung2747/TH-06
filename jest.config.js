module.exports = {
  preset: '@react-native/jest-preset',
  cacheDirectory: '<rootDir>/.cache/jest',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-safe-area-context|react-native-screens)/)',
  ],
};
