export const theme = {
  colors: {
    primary: '#CB2027', // Mau thuong hieu chat UDU
    primaryHover: '#A91920',
    primaryLight: '#FFF1F2',
    secondary: '#0EA5E9', // Sky 500
    background: '#F8FAFC', // Slate 50
    surface: '#FFFFFF',
    textPrimary: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    border: '#E2E8F0', // Slate 200
    borderFocus: '#CB2027',
    error: '#EF4444', // Red 500
    errorBg: '#FEF2F2',
    success: '#10B981', // Emerald 500
    successBg: '#ECFDF5',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  typography: {
    title: {
      fontSize: 26,
      fontWeight: '700' as const,
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 15,
      fontWeight: '400' as const,
      lineHeight: 22,
    },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
    },
    body: {
      fontSize: 14,
      fontWeight: '400' as const,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
    },
  },
};
