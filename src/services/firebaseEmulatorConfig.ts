// Enable only for local testing. On Android, forward ports 9000 and 9099 with adb reverse.
export const firebaseEmulatorConfig = {
  enabled: false,
  host: '127.0.0.1',
  projectId: 'demo-udu-chat',
};
