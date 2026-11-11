import { get, push, ref, serverTimestamp, update } from 'firebase/database';
import { getFirebase } from './firebase';
import { newNotification } from './notificationService';

export const createGroup = async (
  uid: string,
  name: string,
  selected: string[],
) => {
  const people = [...new Set(selected)].filter(person => person !== uid);
  const title = name.trim();
  if (!title || title.length > 80)
    throw new Error('Tên nhóm cần từ 1 đến 80 ký tự.');
  if (people.length < 2)
    throw new Error('Hãy chọn ít nhất hai thành viên khác.');
  const { database } = getFirebase();
  const id = push(ref(database, 'conversations')).key!;
  const members = [uid, ...people];
  const createdAt = serverTimestamp();
  const changes: Record<string, unknown> = {
    [`conversations/${id}`]: {
      type: 'group',
      name: title,
      createdBy: uid,
      createdAt,
      members: Object.fromEntries(members.map(person => [person, true])),
    },
  };
  members.forEach(person => {
    changes[`userChats/${person}/${id}`] = { updatedAt: createdAt, unread: 0 };
    if (person !== uid) {
      changes[`notifications/${person}/${id}`] = newNotification(
        'group',
        id,
        uid,
        `Bạn được thêm vào nhóm ${title}`,
      );
    }
  });
  await update(ref(database), changes);
  return id;
};

export const renameGroup = async (id: string, name: string) => {
  const title = name.trim();
  if (!title || title.length > 80) throw new Error('Tên nhóm cần từ 1 đến 80 ký tự.');
  await update(ref(getFirebase().database), { [`conversations/${id}/name`]: title });
};

export const updateGroupMembers = async (
  id: string,
  actor: string,
  changes: { add?: string[]; remove?: string[] },
) => {
  const { database } = getFirebase();
  const room = await get(ref(database, `conversations/${id}`));
  const value = room.val() as { type: string; members: Record<string, true>; name: string } | null;
  if (!value || value.type !== 'group' || !value.members[actor])
    throw new Error('Bạn không còn là thành viên của nhóm.');
  const members = { ...value.members };
  (changes.add || []).forEach(uid => { members[uid] = true; });
  (changes.remove || []).forEach(uid => { delete members[uid]; });
  if (Object.keys(members).length < 2) throw new Error('Nhóm cần ít nhất hai thành viên.');
  const root = ref(database);
  const updates: Record<string, unknown> = { [`conversations/${id}/members`]: members };
  (changes.add || []).forEach(uid => {
    updates[`userChats/${uid}/${id}`] = { unread: 0, updatedAt: Date.now() };
    const key = push(ref(database, `notifications/${uid}`)).key!;
    updates[`notifications/${uid}/${key}`] = newNotification('group', id, actor, `Bạn được thêm vào nhóm ${value.name}`);
  });
  (changes.remove || []).forEach(uid => {
    updates[`userChats/${uid}/${id}`] = null;
    updates[`activeChats/${id}/${uid}`] = null;
    updates[`typing/${id}/${uid}`] = null;
  });
  await update(root, updates);
};

export const leaveGroup = async (id: string, uid: string, name: string) => {
  const { database } = getFirebase();
  const room = await get(ref(database, `conversations/${id}`));
  const value = room.val() as { type: string; members: Record<string, true> } | null;
  if (!value || value.type !== 'group' || !value.members[uid])
    throw new Error('Bạn không còn là thành viên của nhóm.');
  const members = { ...value.members };
  delete members[uid];
  const key = push(ref(database, `chats/${id}/messages`)).key!;
  await update(ref(database), {
    [`conversations/${id}/members`]: members,
    [`userChats/${uid}/${id}`]: null,
    [`chats/${id}/messages/${key}`]: {
      type: 'system', senderId: uid, text: `${name} đã rời nhóm`, createdAt: Date.now(),
    },
  });
};
