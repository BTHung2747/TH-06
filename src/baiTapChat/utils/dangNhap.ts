export const kiemTraDangNhap = (taiKhoan: string, matKhau: string) => ({
  taiKhoan: !taiKhoan.trim()
    ? 'Vui lòng nhập email.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(taiKhoan.trim())
    ? 'Email không hợp lệ.'
    : undefined,
  matKhau: matKhau.trim() ? undefined : 'Vui lòng nhập mật khẩu.',
});
