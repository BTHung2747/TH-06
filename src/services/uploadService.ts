import { PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
} from 'react-native-image-picker';
import { cloudinaryConfig } from './cloudinaryConfig';

export const pickChatPhoto = async (source: 'camera' | 'library') => {
  if (source === 'camera' && Platform.OS === 'android') {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (permission !== PermissionsAndroid.RESULTS.GRANTED)
      throw new Error(
        'Bạn chưa cấp quyền camera. Hãy cấp quyền trong Cài đặt hoặc chọn ảnh từ thư viện.',
      );
  }
  const options = {
    mediaType: 'photo',
    maxWidth: 1024,
    maxHeight: 1024,
    quality: 0.8,
    includeBase64: false,
  } as const;
  const result =
    source === 'camera'
      ? await launchCamera(options)
      : await launchImageLibrary(options);
  if (result.didCancel) return;
  if (result.errorCode === 'permission')
    throw new Error('Bạn chưa cấp quyền truy cập ảnh hoặc camera.');
  if (result.errorCode === 'camera_unavailable')
    throw new Error('Thiết bị không có camera khả dụng.');
  if (result.errorCode) throw new Error('Không mở được ảnh. Hãy thử ảnh khác.');
  const image = result.assets?.[0];
  if (
    !image?.uri ||
    !image.width ||
    !image.height ||
    Math.max(image.width, image.height) > 1024
  )
    throw new Error('Không chuẩn bị được ảnh với cạnh dài tối đa 1024 px.');
  return image;
};

export const uploadChatPhoto = async (image: Asset) => {
  const { cloudName, unsignedUploadPreset: uploadPreset } = cloudinaryConfig;
  if (!cloudName.trim() || !uploadPreset.trim())
    throw new Error(
      'Chưa cấu hình Cloudinary trong src/services/cloudinaryConfig.ts.',
    );

  const form = new FormData();
  form.append('file', {
    uri: image.uri,
    name: image.fileName || 'chat-photo.jpg',
    type: image.type || 'image/jpeg',
  } as unknown as Blob);
  form.append('upload_preset', uploadPreset.trim());

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cloudName.trim(),
      )}/image/upload`,
      {
        method: 'POST',
        body: form,
        signal: controller.signal,
      },
    );
    const result = await response.json();
    if (
      !response.ok ||
      typeof result.secure_url !== 'string' ||
      !result.secure_url.startsWith('https://res.cloudinary.com/')
    )
      throw new Error(
        result.error?.message || 'Cloudinary không nhận được ảnh.',
      );
    return result.secure_url as string;
  } finally {
    clearTimeout(timeout);
  }
};
