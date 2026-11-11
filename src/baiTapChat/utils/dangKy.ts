import { kiemTraDangNhap } from './dangNhap';
export const kiemTraDangKy = (
  name: string,
  email: string,
  password: string,
  confirm: string,
) => {
  if (!name.trim()) return 'Vui lòng nhập họ tên.';
  const errors = kiemTraDangNhap(email, password);
  if (errors.taiKhoan || errors.matKhau)
    return errors.taiKhoan || errors.matKhau || '';
  if (password.length < 6) return 'Mật khẩu cần ít nhất 6 ký tự.';
  if (password !== confirm) return 'Mật khẩu nhập lại không khớp.';
  return '';
};
