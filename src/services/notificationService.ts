import { onValue, ref, serverTimestamp, update } from 'firebase/database';
import { getFirebase } from './firebase';

export interface RemoteNotification {
  type: 'message' | 'group' | 'reaction';
  convId: string;
  fromUid: string;
  text: string;
  createdAt: number;
  read: boolean;
  messageId?: string;
}

export const newNotification = (
  type: RemoteNotification['type'],
  convId: string,
  fromUid: string,
  text: string,
  messageId?: string,
) => ({
  type,
  convId,
  fromUid,
  text,
  createdAt: serverTimestamp(),
  read: false,
  ...(messageId ? { messageId } : {}),
});

export const watchNotifications = (
  uid: string,
  receive: (items: Record<string, RemoteNotification>) => void,
  fail: (error: Error) => void,
) =>
  onValue(
    ref(getFirebase().database, `notifications/${uid}`),
    snapshot => receive(snapshot.val() || {}),
    fail,
  );

export const readNotifications = async (uid: string, ids: string[]) => {
  if (!ids.length) return;
  await update(
    ref(getFirebase().database, `notifications/${uid}`),
    Object.fromEntries(ids.map(id => [`${id}/read`, true])),
  );
};
