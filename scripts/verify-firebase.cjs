const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { initializeApp, deleteApp } = require('firebase/app');
const {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require('firebase/auth');
const {
  connectDatabaseEmulator,
  getDatabase,
  get,
  goOffline,
  onValue,
  ref,
  serverTimestamp,
  set,
} = require('firebase/database');

const demo = process.argv.includes('--demo');
const projectId = 'demo-udu-chat';
const password = 'UduDemo600';
const clients = [];
const root = path.resolve(__dirname, '..');
let selectedClient;

function loadService(name) {
  const filename = path.join(root, 'src', 'services', name + '.ts');
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', code)(
    id => {
      if (id === './firebase') return { getFirebase: () => selectedClient };
      return id.startsWith('./') ? loadService(id.slice(2)) : require(id);
    },
    module,
    module.exports,
  );
  return module.exports;
}

const chat = loadService('chatService');
const { createGroup } = loadService('groupService');
const { startChatActivity } = loadService('chatActivityService');
const { batTrangThaiOnline } = loadService('presenceService');
const { readNotifications } = loadService('notificationService');

const as = (client, action) => {
  selectedClient = client;
  return action();
};

async function account(label, name, suffix) {
  const email = `${label}${suffix}@example.test`;
  const app = initializeApp(
    {
      projectId,
      apiKey: 'demo-api-key',
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`,
    },
    label,
  );
  const auth = getAuth(app);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  const database = getDatabase(app);
  connectDatabaseEmulator(database, '127.0.0.1', 9000);
  const client = { app, auth, database, email };
  clients.push(client);
  const credentials = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  ).catch(error => {
    if (error.code === 'auth/email-already-in-use' && demo)
      return signInWithEmailAndPassword(auth, email, password);
    throw error;
  });
  client.uid = credentials.user.uid;
  await set(ref(database, `users/${client.uid}`), { name });
  return client;
}

const read = async (client, target) =>
  (await get(ref(client.database, target))).val();
const write = (client, target, data) => set(ref(client.database, target), data);
const waitFor = (client, target, predicate) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      stop();
      reject(new Error('Timed out: ' + target));
    }, 10000);
    const done = (action, value) => {
      clearTimeout(timeout);
      queueMicrotask(() => stop());
      action(value);
    };
    const stop = onValue(
      ref(client.database, target),
      snapshot => {
        if (predicate(snapshot.val())) done(resolve, snapshot.val());
      },
      error => done(reject, error),
    );
  });

const denied = async (label, action) => {
  await assert.rejects(action, /permission_denied|permission denied/i);
  console.log(`PERMISSION_DENIED · ${label}`);
};

const page = (client, id, before) =>
  new Promise((resolve, reject) => {
    const stop = as(client, () =>
      chat.watchMessages(
        id,
        result => {
          queueMicrotask(() => stop());
          resolve(result);
        },
        reject,
        before,
      ),
    );
  });

const send = (client, id, room, payload) =>
  as(client, () => chat.guiTinFirebase(id, client.uid, room, payload));

async function main() {
  const suffix = demo ? '' : Date.now();
  const [a, b, c, guest] = await Promise.all([
    account('an', 'Nguyễn An', suffix),
    account('binh', 'Trần Bình', suffix),
    account('linh', 'Phạm Linh', suffix),
    account('guest', 'Khách thử Rules', suffix),
  ]);

  const id = await as(a, () =>
    createGroup(a.uid, 'Nhóm thực hành 6', [b.uid, c.uid]),
  );
  const room = await read(b, `conversations/${id}`);
  assert.equal(Object.keys(room.members).length, 3);
  const messages = `chats/${id}/messages`;
  const inboxB = `notifications/${b.uid}`;
  const inboxC = `notifications/${c.uid}`;
  const indexB = `userChats/${b.uid}/${id}`;
  assert.equal((await read(b, `${inboxB}/${id}`)).type, 'group');
  console.log(
    'PASS · Tạo nhóm 3 người, chỉ mục thành viên và thông báo lời mời',
  );

  const errors = [];
  const activity = as(b, () =>
    startChatActivity(id, b.uid, cause => errors.push(cause)),
  );
  const stopPresence = as(b, () =>
    batTrangThaiOnline(b.uid, cause => errors.push(cause)),
  );
  await waitFor(a, `activeChats/${id}/${b.uid}`, Boolean);
  await waitFor(a, `presence/${b.uid}/connections`, Boolean);
  activity.changeTyping(true);
  await waitFor(a, `typing/${id}/${b.uid}`, Boolean);
  await waitFor(a, `typing/${id}/${b.uid}`, value => !value);
  console.log('PASS · Đang soạn tin xuất hiện và tự tắt sau 3 giây');

  await Promise.all([
    waitFor(b, messages, value =>
      Object.values(value || {}).some(
        item => item.text === 'Chào nhóm, mọi người thấy tin này chưa?',
      ),
    ),
    send(a, id, room, {
      type: 'text',
      text: 'Chào nhóm, mọi người thấy tin này chưa?',
    }),
  ]);
  const [entry] = await page(b, id);
  assert.equal((await read(b, indexB)).unread, 1);
  assert.equal(await read(b, `${inboxB}/${entry[0]}`), null);
  assert.equal((await read(c, `${inboxC}/${entry[0]}`)).type, 'message');
  await as(b, () => chat.danhDauDaDoc(id, b.uid, entry, true));
  assert.equal((await read(b, indexB)).unread, 0);
  assert.ok(
    (await read(a, `readStatus/${id}/${b.uid}`)).seenAt >= entry[1].createdAt,
  );
  console.log(
    'PASS · Tin đến realtime, chưa đọc riêng, đã xem và thông báo theo phòng đang mở',
  );

  await Promise.all([
    as(b, () => chat.reactToMessage(id, b.uid, entry, '❤️')),
    as(c, () => chat.reactToMessage(id, c.uid, entry, '❤️')),
  ]);
  assert.deepEqual(await read(a, `${messages}/${entry[0]}/reactions`), {
    [b.uid]: '❤️',
    [c.uid]: '❤️',
  });
  assert.equal(
    Object.values(await read(a, `notifications/${a.uid}`)).filter(
      item => item.type === 'reaction',
    ).length,
    2,
  );
  await as(c, () => readNotifications(c.uid, [id, entry[0]]));
  assert.equal((await read(c, `${inboxC}/${entry[0]}`)).read, true);
  console.log(
    'PASS · Hai cảm xúc cùng biểu tượng, thông báo cảm xúc và đọc nhiều thông báo',
  );

  await send(a, id, room, {
    type: 'text',
    text: 'Tin dùng để kiểm tra thu hồi',
  });
  const recalled = (await page(b, id)).at(-1);
  await denied('Thành viên khác thu hồi tin của An', () =>
    as(b, () => chat.recallMessage(id, recalled[0])),
  );
  await as(a, () => chat.recallMessage(id, recalled[0]));
  assert.equal((await read(b, `${messages}/${recalled[0]}`)).recalled, true);
  await denied('Người ngoài đọc tin nhắn nhóm', () => read(guest, messages));
  await denied('Người ngoài gửi tin vào nhóm', () =>
    write(guest, `${messages}/forged`, {
      type: 'text',
      text: 'forged',
      createdAt: serverTimestamp(),
      senderId: guest.uid,
    }),
  );
  await denied('Bình ghi cảm xúc dưới UID của Linh', () =>
    write(b, `${messages}/${entry[0]}/reactions/${c.uid}`, '👍'),
  );
  await denied('Bình ghi đang soạn tin dưới UID của Linh', () =>
    write(b, `typing/${id}/${c.uid}/forged`, serverTimestamp()),
  );
  await denied('Bình sửa số chưa đọc của Linh', () =>
    write(b, `userChats/${c.uid}/${id}/unread`, 9),
  );
  await denied('Bình đọc thông báo của Linh', () => read(b, inboxC));
  console.log(
    'PASS · Thu hồi giữ node và Rules từ chối các thao tác trái quyền',
  );

  await send(b, id, room, {
    type: 'location',
    latitude: 21.0278,
    longitude: 105.8342,
  });
  await send(c, id, room, {
    type: 'image',
    imageUrl: 'https://res.cloudinary.com/demo/image/upload/w_600/sample.jpg',
  });
  if (!demo) {
    const before = (await read(c, `userChats/${c.uid}/${id}`)).unread;
    await Promise.all([
      send(a, id, room, { type: 'text', text: 'Tin đồng thời của An' }),
      send(b, id, room, { type: 'text', text: 'Tin đồng thời của Bình' }),
    ]);
    assert.equal(
      (await read(c, `userChats/${c.uid}/${id}`)).unread,
      before + 2,
    );
    for (let i = 0; i < 19; i++) {
      await send(a, id, room, {
        type: 'text',
        text: `Tin phân trang ${i + 1}`,
      });
    }
    const newest = await page(a, id);
    const oldest = await page(a, id, newest[0]);
    assert.equal(newest.length, 20);
    assert.equal(oldest.length, 5);
    assert.equal(new Set([...newest, ...oldest].map(([key]) => key)).size, 25);
    assert.ok(
      oldest.some(([, item]) => item.type === 'image' && item.imageUrl),
    );
    assert.ok(
      oldest.some(([, item]) => item.type === 'location' && item.latitude),
    );
    await denied('Bình dùng mốc đọc cũ để xóa số chưa đọc của tin mới', () =>
      as(b, () => chat.danhDauDaDoc(id, b.uid, entry, true)),
    );
    console.log(
      'PASS · Tin vị trí, tin ảnh mẫu, gửi đồng thời, phân trang 20 + 5 và bảo vệ mốc đọc',
    );
  }

  const direct = await as(a, () => chat.moCuocTroChuyen(a.uid, b.uid));
  const directRoom = await read(b, `conversations/${direct}`);
  await send(a, direct, directRoom, {
    type: 'text',
    text: 'Chào Bình, đây là tin nhắn riêng.',
  });
  assert.equal((await page(b, direct)).length, 1);
  console.log('PASS · Tin nhắn trực tiếp');

  activity.changeTyping(true);
  await waitFor(a, `typing/${id}/${b.uid}`, Boolean);
  goOffline(b.database);
  await waitFor(a, `activeChats/${id}/${b.uid}`, value => !value);
  await waitFor(a, `typing/${id}/${b.uid}`, value => !value);
  await waitFor(a, `presence/${b.uid}/connections`, value => !value);
  await waitFor(a, `presence/${b.uid}/lastOnline`, Boolean);
  activity.close();
  assert.deepEqual(errors, []);
  // The B client is offline. Its presence removal is already handled by onDisconnect.
  void stopPresence;
  console.log(
    'PASS · Mất kết nối dọn trạng thái hoạt động, online, typing và ghi lastOnline',
  );

  if (demo)
    console.log(
      `Tài khoản emulator: ${a.email}, ${b.email}, ${c.email} · Mật khẩu thử: ${password}`,
    );
}

const watchdog = setTimeout(() => {
  console.error(
    'Firebase Emulator không phản hồi. Kiểm tra README và cổng 9000/9099.',
  );
  process.exit(1);
}, 60000);
main()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Promise.allSettled(clients.map(client => deleteApp(client.app)));
    clearTimeout(watchdog);
    process.exit(process.exitCode || 0);
  });
