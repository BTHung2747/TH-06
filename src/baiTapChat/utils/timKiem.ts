export const chuanHoa = (value: string) =>
  value
    .trim()
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

export const khopTimKiem = (text: string, query: string) =>
  chuanHoa(text).includes(chuanHoa(query));
