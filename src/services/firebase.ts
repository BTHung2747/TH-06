import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  initializeAuth,
  inMemoryPersistence,
} from 'firebase/auth';
import { connectDatabaseEmulator, getDatabase } from 'firebase/database';
import { firebaseConfig } from './firebaseConfig';
import { firebaseEmulatorConfig } from './firebaseEmulatorConfig';

const useEmulators = __DEV__ && firebaseEmulatorConfig.enabled;

export const firebaseDaCauHinh = () =>
  useEmulators ||
  Object.values(firebaseConfig).every(value => Boolean(value.trim()));

export const getFirebase = () => {
  if (!firebaseDaCauHinh()) {
    throw new Error(
      'Chưa cấu hình Firebase. Điền Web config trong src/services/firebaseConfig.ts.',
    );
  }
  const existing = getApps().some(app => app.name === 'udu-chat');
  const app = existing
    ? getApp('udu-chat')
    : initializeApp(
        useEmulators
          ? {
              projectId: firebaseEmulatorConfig.projectId,
              apiKey: 'demo-api-key',
              databaseURL: `https://${firebaseEmulatorConfig.projectId}-default-rtdb.firebaseio.com`,
            }
          : firebaseConfig,
        'udu-chat',
      );
  const auth = existing
    ? getAuth(app)
    : initializeAuth(app, { persistence: inMemoryPersistence });
  const database = getDatabase(app);
  if (!existing && useEmulators) {
    const host = firebaseEmulatorConfig.host;
    connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
    connectDatabaseEmulator(database, host, 9000);
  }
  return { auth, database };
};

export const loiFirebase = (error: unknown): string => {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
    'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
    'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
    'auth/email-already-in-use': 'Email này đã được đăng ký.',
    'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
    'auth/weak-password': 'Mật khẩu cần ít nhất 6 ký tự.',
    'auth/network-request-failed':
      'Không kết nối được Firebase. Kiểm tra mạng và thử lại.',
    'auth/too-many-requests': 'Bạn đã thử quá nhiều lần. Vui lòng thử lại sau.',
    'auth/operation-not-allowed':
      'Chưa bật Email/Password trong Firebase Authentication.',
    PERMISSION_DENIED:
      'Không có quyền truy cập dữ liệu. Kiểm tra luật Realtime Database.',
    'permission-denied':
      'Không có quyền truy cập dữ liệu. Kiểm tra luật Realtime Database.',
  };
  return (
    (code && messages[code]) ||
    (error instanceof Error
      ? error.message
      : 'Có lỗi xảy ra. Vui lòng thử lại.')
  );
};
