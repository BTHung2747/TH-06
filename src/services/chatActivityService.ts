import {
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { getFirebase } from './firebase';

export type TypingState = Record<string, Record<string, number>>;

export const watchTyping = (
  id: string,
  receive: (value: TypingState) => void,
  fail: (error: Error) => void,
) =>
  onValue(
    ref(getFirebase().database, `typing/${id}`),
    snapshot => receive(snapshot.val() || {}),
    fail,
  );

export const startChatActivity = (
  id: string,
  uid: string,
  fail: (error: Error) => void,
) => {
  const { database } = getFirebase();
  const root = ref(database);
  let closed = false;
  let connection: string | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let typing = false;
  const typingPath = (key: string) => `typing/${id}/${uid}/${key}`;
  const activePath = (key: string) => `activeChats/${id}/${uid}/${key}`;
  const clear = () => {
    typing = false;
    clearTimeout(timer);
    if (connection) remove(ref(database, typingPath(connection))).catch(fail);
  };
  const stop = onValue(
    ref(database, '.info/connected'),
    snapshot => {
      if (snapshot.val() !== true) {
        connection = undefined;
        return;
      }
      const key = push(ref(database, activePath('sessions'))).key!;
      const paths = { [activePath(key)]: null, [typingPath(key)]: null };
      const disconnect = onDisconnect(root);
      disconnect
        .update(paths)
        .then(async () => {
          if (closed) return;
          connection = key;
          await update(root, {
            [activePath(key)]: true,
            ...(typing ? { [typingPath(key)]: serverTimestamp() } : {}),
          });
          if (closed) await update(root, paths);
        })
        .catch(fail);
    },
    fail,
  );
  return {
    changeTyping: (hasText: boolean) => {
      if (!hasText) return clear();
      typing = true;
      clearTimeout(timer);
      if (connection)
        set(ref(database, typingPath(connection)), serverTimestamp()).catch(
          fail,
        );
      timer = setTimeout(clear, 3000);
    },
    clearTyping: clear,
    close: () => {
      closed = true;
      clearTimeout(timer);
      stop();
      if (connection)
        update(root, {
          [activePath(connection)]: null,
          [typingPath(connection)]: null,
        }).catch(fail);
    },
  };
};
