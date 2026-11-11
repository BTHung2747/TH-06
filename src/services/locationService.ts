import Geolocation from '@react-native-community/geolocation';
import { Linking, PermissionsAndroid, Platform } from 'react-native';
import { mapUrl } from './chatModel';

export const layViTriHienTai = async (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  Geolocation.setRNConfiguration({
    skipPermissionRequests: true,
    authorizationLevel: 'whenInUse',
    enableBackgroundLocationUpdates: false,
    locationProvider: 'auto',
  });
  if (Platform.OS === 'android') {
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ]);
    if (
      !Object.values(permissions).some(
        value => value === PermissionsAndroid.RESULTS.GRANTED,
      )
    ) {
      throw new Error(
        'Bạn đã từ chối quyền vị trí. Có thể bật lại trong Cài đặt của thiết bị.',
      );
    }
  } else {
    await new Promise<void>((resolve, reject) =>
      Geolocation.requestAuthorization(resolve, () =>
        reject(new Error('Bạn đã từ chối quyền vị trí.')),
      ),
    );
  }
  return new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      error =>
        reject(
          new Error(
            error.code === 1
              ? 'Bạn đã từ chối quyền vị trí.'
              : 'Không lấy được vị trí. Hãy bật GPS và thử lại.',
          ),
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    ),
  );
};
export const moGoogleMaps = (latitude: number, longitude: number) =>
  Linking.openURL(mapUrl(latitude, longitude));
