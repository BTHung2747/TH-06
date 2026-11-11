import { onValue, ref } from 'firebase/database';
import { getFirebase } from './firebase';

export const langNgheDanhBa = (
  uid: string,
  nhanDanhBa: (
    danhBa: { id: string; ten: string; photoURL?: string; online: boolean; lastOnline?: number }[],
  ) => void,
  nhanTenBanThan: (ten: string) => void,
  baoLoi: (loi: Error) => void,
) => {
  const { database } = getFirebase();
  let dangLangNghe = true;
  let hoSo: Record<string, { name: string; photoURL?: string }> = {};
  let ketNoi: Record<
    string,
    { connections?: Record<string, boolean>; lastOnline?: number }
  > = {};
  const capNhat = () => {
    if (!dangLangNghe) return;
    nhanDanhBa(
      Object.entries(hoSo)
        .filter(([id]) => id !== uid)
        .map(([id, nguoiDung]) => ({
          id,
          ten: nguoiDung.name,
          photoURL: nguoiDung.photoURL,
          lastOnline: ketNoi[id]?.lastOnline,
          online: Object.values(ketNoi[id]?.connections || {}).some(Boolean),
        }))
        .sort((a, b) => a.ten.localeCompare(b.ten, 'vi')),
    );
    if (hoSo[uid]) nhanTenBanThan(hoSo[uid].name);
  };
  const dungHoSo = onValue(
    ref(database, 'users'),
    duLieu => {
      hoSo = duLieu.val() || {};
      capNhat();
    },
    baoLoi,
  );
  const dungKetNoi = onValue(
    ref(database, 'presence'),
    duLieu => {
      ketNoi = duLieu.val() || {};
      capNhat();
    },
    baoLoi,
  );
  return () => {
    dangLangNghe = false;
    dungHoSo();
    dungKetNoi();
  };
};
