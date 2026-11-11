import {
  endBefore,
  get,
  increment,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  serverTimestamp,
  set,
  startAt,
  update,
  type DataSnapshot,
} from 'firebase/database';
import { getFirebase } from './firebase';
import {
  conversationId,
  messagePreview,
  PAGE_SIZE,
  type ChatSummary,
  type Conversation,
  type MessageEntry,
  type Reaction,
  type ReadReceipt,
  type RemoteMessage,
} from './chatModel';
import { newNotification } from './notificationService';

const dbRef = (path?: string) => ref(getFirebase().database, path);
const messagePath = (id: string) => `chats/${id}/messages`;
const messageQuery = (id: string, count: number, before?: MessageEntry) =>
  before
    ? query(
        dbRef(messagePath(id)),
        orderByChild('createdAt'),
        endBefore(before[1].createdAt, before[0]),
        limitToLast(count),
      )
    : query(
        dbRef(messagePath(id)),
        orderByChild('createdAt'),
        limitToLast(count),
      );

const messageEntries = (snapshot: DataSnapshot) => {
  const items: MessageEntry[] = [];
  snapshot.forEach(child => {
    items.push([child.key!, child.val()]);
  });
  return items;
};

export const watchConversation = (
  id: string,
  receive: (room: Conversation | null) => void,
  fail: (error: Error) => void,
) =>
  onValue(
    dbRef(`conversations/${id}`),
    snapshot => receive(snapshot.val()),
    fail,
  );

export const watchMessages = (
  id: string,
  receive: (items: MessageEntry[]) => void,
  fail: (error: Error) => void,
  before?: MessageEntry,
) =>
  onValue(
    messageQuery(id, PAGE_SIZE, before),
    snapshot => receive(messageEntries(snapshot)),
    fail,
  );

export const watchMessagesSince = (
  id: string,
  [key, message]: MessageEntry,
  receive: (items: MessageEntry[]) => void,
  fail: (error: Error) => void,
) =>
  onValue(
    query(
      dbRef(messagePath(id)),
      orderByChild('createdAt'),
      startAt(message.createdAt, key),
    ),
    snapshot => receive(messageEntries(snapshot)),
    fail,
  );

export const watchReceipt = (
  id: string,
  receive: (items: Record<string, ReadReceipt>) => void,
  fail: (error: Error) => void,
) =>
  onValue(
    dbRef(`readStatus/${id}`),
    snapshot => receive(snapshot.val() || {}),
    fail,
  );

export interface ChatRow {
  room?: Conversation;
  summary?: ChatSummary;
  legacyPeer?: string;
  last?: MessageEntry;
}

export const langNgheCuocTroChuyen = (
  uid: string,
  receive: (items: Record<string, ChatRow>) => void,
  fail: (error: Error) => void,
) => {
  const rows: Record<string, ChatRow> = {};
  const subscriptions = new Map<string, () => void>();
  const publish = () => receive({ ...rows });
  const stop = onValue(
    dbRef(`userChats/${uid}`),
    snapshot => {
      const summaries: Record<string, ChatSummary | string> =
        snapshot.val() || {};
      subscriptions.forEach((unsubscribe, id) => {
        if (id in summaries) return;
        unsubscribe();
        subscriptions.delete(id);
        delete rows[id];
      });
      Object.entries(summaries).forEach(([id, entry]) => {
        rows[id] = {
          ...rows[id],
          summary: typeof entry === 'string' ? undefined : entry,
          legacyPeer: typeof entry === 'string' ? entry : undefined,
        };
        if (subscriptions.has(id)) return;
        const stopRoom = watchConversation(
          id,
          room => {
            rows[id] = { ...rows[id], room: room || undefined };
            publish();
          },
          fail,
        );
        const stopLast = onValue(
          messageQuery(id, 1),
          last => {
            rows[id] = { ...rows[id], last: messageEntries(last)[0] };
            publish();
          },
          fail,
        );
        subscriptions.set(id, () => {
          stopRoom();
          stopLast();
        });
      });
      publish();
    },
    fail,
  );
  return () => {
    stop();
    subscriptions.forEach(unsubscribe => unsubscribe());
    subscriptions.clear();
  };
};

export const moCuocTroChuyen = async (uid: string, peerId: string) => {
  const id = conversationId(uid, peerId);
  const root = dbRef();
  const target = dbRef(`conversations/${id}`);
  if ((await get(target)).exists()) return id;
  const [participantA, participantB] = [uid, peerId].sort();
  const createdAt = serverTimestamp();
  try {
    await update(root, {
      [`conversations/${id}`]: {
        type: 'direct',
        participantA,
        participantB,
        members: { [uid]: true, [peerId]: true },
        createdBy: uid,
        createdAt,
      },
      [`userChats/${uid}/${id}`]: { unread: 0, updatedAt: createdAt },
      [`userChats/${peerId}/${id}`]: { unread: 0, updatedAt: createdAt },
    });
  } catch (error) {
    if (!(await get(target)).exists()) throw error;
  }
  return id;
};

export const guiTinFirebase = async (
  id: string,
  uid: string,
  room: Conversation,
  payload: Pick<
    RemoteMessage,
    'type' | 'text' | 'latitude' | 'longitude' | 'imageUrl' | 'replyTo'
  >,
) => {
  if (payload.type === 'text' && !payload.text?.trim())
    throw new Error('Không thể gửi tin nhắn trống.');
  const root = dbRef();
  const key = push(dbRef(messagePath(id))).key!;
  const createdAt = serverTimestamp();
  const active = (await get(dbRef(`activeChats/${id}`))).val() || {};
  const changes: Record<string, unknown> = {
    [`${messagePath(id)}/${key}`]: { ...payload, senderId: uid, createdAt },
  };
  Object.keys(room.members).forEach(member => {
    const row = `userChats/${member}/${id}`;
    changes[`${row}/lastMessage`] = key;
    changes[`${row}/lastSenderId`] = uid;
    changes[`${row}/updatedAt`] = createdAt;
    if (member === uid) return;
    changes[`${row}/unread`] = increment(1);
    if (!active[member]) {
      changes[`notifications/${member}/${key}`] = newNotification(
        'message',
        id,
        uid,
        messagePreview({ ...payload, senderId: uid, createdAt: 0 }),
        key,
      );
    }
  });
  await update(root, changes);
};

export const danhDauDaDoc = (
  id: string,
  uid: string,
  [key, message]: MessageEntry,
  clearUnread: boolean,
) =>
  update(dbRef(), {
    [`readStatus/${id}/${uid}`]: {
      messageId: key,
      messageAt: message.createdAt,
      seenAt: serverTimestamp(),
    },
    ...(clearUnread ? { [`userChats/${uid}/${id}/unread`]: 0 } : {}),
  });

export const recallMessage = (id: string, messageId: string) =>
  set(dbRef(`${messagePath(id)}/${messageId}/recalled`), true);

export const reactToMessage = async (
  id: string,
  uid: string,
  [key, message]: MessageEntry,
  reaction: Reaction,
) => {
  const next = message.reactions?.[uid] === reaction ? null : reaction;
  const changes: Record<string, unknown> = {
    [`${messagePath(id)}/${key}/reactions/${uid}`]: next,
  };
  if (next && message.senderId !== uid) {
    const notice = push(dbRef(`notifications/${message.senderId}`)).key!;
    changes[`notifications/${message.senderId}/${notice}`] = newNotification(
      'reaction',
      id,
      uid,
      `Đã thả ${next} vào tin nhắn của bạn`,
      key,
    );
  }
  await update(dbRef(), changes);
};
