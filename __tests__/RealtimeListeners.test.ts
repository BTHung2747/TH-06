import { langNgheCuocTroChuyen } from '../src/services/chatService';
import { onValue } from 'firebase/database';

const mockCallbacks = new Map<string, (snapshot: unknown) => void>();
const mockStops = new Map<string, jest.Mock>();

jest.mock('../src/services/firebase', () => ({
  getFirebase: () => ({ database: {} }),
}));
jest.mock('firebase/database', () => ({
  ref: (_: unknown, path: string) => ({ path }),
  query: (target: unknown) => target,
  orderByChild: jest.fn(),
  limitToLast: jest.fn(),
  onValue: jest.fn(
    (target: { path: string }, callback: (snapshot: unknown) => void) => {
      mockCallbacks.set(target.path, callback);
      const stop = jest.fn();
      mockStops.set(target.path, stop);
      return stop;
    },
  ),
}));

const emit = (path: string, value: unknown) =>
  mockCallbacks.get(path)!({
    val: () => value,
    forEach: (fn: (child: unknown) => void) => {
      for (const [key, child] of Object.entries(value || {}))
        fn({ key, val: () => child });
    },
  });

beforeEach(() => {
  mockCallbacks.clear();
  mockStops.clear();
  jest.clearAllMocks();
});

test('subscribes once to metadata and a latest-message query per room and cleans both up', () => {
  const received = jest.fn();
  const stop = langNgheCuocTroChuyen('a', received, jest.fn());
  emit('userChats/a', { one: { unread: 2 }, two: 'c' });
  expect(onValue).toHaveBeenCalledTimes(5);
  emit('userChats/a', { one: { unread: 1 }, two: 'c' });
  expect(onValue).toHaveBeenCalledTimes(5);
  emit('chats/one/messages', { first: { text: 'hello' } });
  emit('chats/one/messages', { first: { text: 'hello', recalled: true } });
  expect(received.mock.calls.at(-1)![0].one.last[1].recalled).toBe(true);
  emit('userChats/a', { one: { unread: 1 } });
  expect(mockStops.get('conversations/two')).toHaveBeenCalledTimes(1);
  expect(mockStops.get('chats/two/messages')).toHaveBeenCalledTimes(1);
  stop();
  expect(mockStops.get('userChats/a')).toHaveBeenCalledTimes(1);
  expect(mockStops.get('conversations/one')).toHaveBeenCalledTimes(1);
  expect(mockStops.get('chats/one/messages')).toHaveBeenCalledTimes(1);
});
