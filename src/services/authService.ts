import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { get, ref, set } from 'firebase/database';
import { getFirebase } from './firebase';

export const damBaoHoSo = async (user: User) => {
  const profile = ref(getFirebase().database, `users/${user.uid}`);
  if (!(await get(profile)).exists()) {
    await set(profile, {
      name: user.displayName || user.email?.split('@')[0] || 'Người dùng',
    });
  }
};

export const dangNhapFirebase = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(
    getFirebase().auth,
    email.trim(),
    password,
  );
  await damBaoHoSo(user);
};

export const dangKyFirebase = async (
  name: string,
  email: string,
  password: string,
) => {
  const { user } = await createUserWithEmailAndPassword(
    getFirebase().auth,
    email.trim(),
    password,
  );
  await updateProfile(user, { displayName: name.trim() });
  await set(ref(getFirebase().database, `users/${user.uid}`), {
    name: name.trim(),
  });
};


export const dangXuatFirebase = () => signOut(getFirebase().auth);

export const capNhatHoSo = async (name: string, photoURL?: string) => {
  const user = getFirebase().auth.currentUser;
  if (!user) throw new Error('Vui lòng đăng nhập.');
  const title = name.trim();
  if (!title || title.length > 80) throw new Error('Tên cần từ 1 đến 80 ký tự.');
  await updateProfile(user, { displayName: title, ...(photoURL ? { photoURL } : {}) });
  await set(ref(getFirebase().database, `users/${user.uid}`), {
    name: title,
    ...(photoURL || user.photoURL ? { photoURL: photoURL || user.photoURL } : {}),
  });
};

export const langNgheTaiKhoan = (
  nhanTaiKhoan: (user: User | null) => void,
  baoLoi: (loi: Error) => void,
) =>
  onAuthStateChanged(
    getFirebase().auth,
    user => {
      nhanTaiKhoan(user);
      if (user) damBaoHoSo(user).catch(baoLoi);
    },
    baoLoi,
  );
