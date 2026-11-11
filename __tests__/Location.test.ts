import { Linking, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { layViTriHienTai, moGoogleMaps } from '../src/services/locationService';
jest.mock('@react-native-community/geolocation', () => ({
  setRNConfiguration: jest.fn(),
  requestAuthorization: jest.fn(),
  getCurrentPosition: jest.fn(),
}));
const originalOS = Platform.OS;
const ketQuaQuyen = (duocCap: boolean) =>
  Object.fromEntries(
    Object.values(PermissionsAndroid.PERMISSIONS).map(quyen => [
      quyen,
      duocCap
        ? PermissionsAndroid.RESULTS.GRANTED
        : PermissionsAndroid.RESULTS.DENIED,
    ]),
  ) as Awaited<ReturnType<typeof PermissionsAndroid.requestMultiple>>;
beforeEach(() => {
  Object.defineProperty(Platform, 'OS', {
    value: 'android',
    configurable: true,
  });
  jest.clearAllMocks();
});
afterEach(() => {
  Object.defineProperty(Platform, 'OS', {
    value: originalOS,
    configurable: true,
  });
  jest.restoreAllMocks();
});
test('denied permission never reads device coordinates', async () => {
  jest
    .spyOn(PermissionsAndroid, 'requestMultiple')
    .mockResolvedValue(ketQuaQuyen(false));
  await expect(layViTriHienTai()).rejects.toThrow('từ chối');
  expect(Geolocation.getCurrentPosition).not.toHaveBeenCalled();
});
test('granted permission resolves exact GPS coordinates and opens correct Maps URL', async () => {
  jest
    .spyOn(PermissionsAndroid, 'requestMultiple')
    .mockResolvedValue(ketQuaQuyen(true));
  (Geolocation.getCurrentPosition as jest.Mock).mockImplementation(success =>
    success({ coords: { latitude: 10.762, longitude: 106.66 } }),
  );
  await expect(layViTriHienTai()).resolves.toEqual({
    latitude: 10.762,
    longitude: 106.66,
  });
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  await moGoogleMaps(10.762, 106.66);
  expect(open).toHaveBeenCalledWith(
    'https://www.google.com/maps/search/?api=1&query=10.762,106.66',
  );
});
