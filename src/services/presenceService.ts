import {
  onDisconnect,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  set,
} from 'firebase/database';
import { getFirebase } from './firebase';

export const batTrangThaiOnline = (
  uid: string,
  onError: (error: Error) => void,
) => {
  const { database } = getFirebase();
  let active = true;
  let connected = false;
  let stopping: Promise<void> | undefined;
  const lastOnline = ref(database, `presence/${uid}/lastOnline`);
  const connections = new Set<ReturnType<typeof push>>();
  const stop = onValue(
    ref(database, '.info/connected'),
    snapshot => {
      connected = snapshot.val() === true;
      if (!connected) return;
      const connection = push(ref(database, `presence/${uid}/connections`));
      connections.add(connection);
      const disconnect = onDisconnect(connection);
      disconnect
        .remove()
        .then(async () => {
          if (!active) {
            await disconnect.cancel();
            return;
          }
          await set(connection, true);
          if (!active) {
            await remove(connection);
            await disconnect.cancel();
          }
        })
        .catch(onError);
      onDisconnect(lastOnline).set(serverTimestamp()).catch(onError);
    },
    onError,
  );
  return () => {
    if (stopping) return stopping;
    active = false;
    stop();
    if (!connected) return Promise.resolve();
    // Remove only this device's connections; other signed-in devices stay online.
    stopping = Promise.all(
      Array.from(connections, async connection => {
        await remove(connection);
        await onDisconnect(connection).cancel();
      }),
    ).then(async () => {
      await set(lastOnline, serverTimestamp());
    });
    return stopping;
  };
};
