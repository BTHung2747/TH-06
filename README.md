# UDU Chat · Bài thực hành 6

Ứng dụng React Native CLI phát triển từ Bài 5. Đăng ký và đăng nhập bằng Firebase Authentication. Danh bạ, chat riêng, chat nhóm, ảnh, vị trí, cảm xúc, thu hồi, lượt đọc và thông báo dùng Firebase Realtime Database.

## Cấu hình Firebase thật

1. Mở Firebase Console, tạo dự án, thêm một Web app và bật **Authentication → Email/Password**.
2. Tạo **Realtime Database**. Điền Web config có `databaseURL` vào `src/services/firebaseConfig.ts`.
3. Trong **Realtime Database → Rules**, dán `firebase/database.rules.json` và chọn **Publish**. Kiểm tra đúng dự án trước khi xuất bản. `firebase.json` trỏ tới cùng tệp luật.
4. Để `enabled: false` trong `src/services/firebaseEmulatorConfig.ts`. Đăng ký ba tài khoản khác nhau để thử chat nhóm.

Các thông số Web Firebase là định danh công khai của app. Mật khẩu lưu trong Firebase Authentication. Ứng dụng dùng phiên đăng nhập trong bộ nhớ nên cần đăng nhập lại sau khi khởi động lại.

## Cấu hình Cloudinary

1. Trong Cloudinary Console vào **Settings → Upload → Upload presets**. Tạo preset có **Signing mode = Unsigned** dành cho ảnh chat. Có thể đặt thư mục riêng và giới hạn định dạng ảnh ở preset.
2. Điền `cloudName` và tên preset vào `unsignedUploadPreset` trong `src/services/cloudinaryConfig.ts`. Giữ API secret ở Cloudinary.
3. Chạy lại Metro hoặc tải lại ứng dụng. Trong một phòng, nhấn 📷 để chụp hoặc chọn ảnh. Image Picker giới hạn chiều rộng và chiều cao trước khi tải lên. Firebase lưu URL HTTPS trả về. Nếu upload lỗi, chọn **Thử lại** từ bong bóng tạm.

Android yêu cầu quyền camera khi chụp. Chọn ảnh dùng trình chọn ảnh hệ thống. Trên iOS, cài Pods và cấp quyền camera/thư viện khi hệ điều hành hỏi.

Tham khảo [tài liệu unsigned upload của Cloudinary](https://cloudinary.com/documentation/upload_images) và [tùy chọn của React Native Image Picker](https://github.com/react-native-image-picker/react-native-image-picker#options).

## Chạy trên Windows với Pixel_7 có sẵn

Dùng Node ≥ 22.11, JDK 17, Gradle 9.4.1, Android compile SDK 37, Build Tools 37.0.0, NDK 27.1.12297006. Script Android dùng lại SDK, JDK và cache Gradle hiện có. Đặt `ANDROID_HOME` theo máy nếu chưa có. Khi lưu dự án trên ổ D, cache npm, Metro và phần Gradle tải thêm nằm dưới `.cache` của dự án trên D.

```powershell
npm ci
npm start
```

Mở AVD **Pixel_7** đã có. Trong terminal khác chạy:

```powershell
npm run android
```

Nếu thiếu AndroidX ExifInterface của Image Picker trong cache cũ, dùng `npm run android:build` một lần để tải phụ thuộc và build. Sau đó dùng `npm run android` để cài APK vào máy ảo đang chạy. Lệnh `npm run android:offline` chỉ build. APK debug nằm ở `android/app/build/outputs/apk/debug/app-debug.apk`. Với thiết bị ARM64, dùng `npm run android:offline -- -Architecture arm64-v8a`.

## Chạy cục bộ với Firebase Emulator Suite

Emulator dùng dự án `demo-udu-chat` và chạy trên máy. Dùng JDK 21+ cho Firebase CLI hiện hành, tách với JDK 17 của Gradle.

```powershell
$env:FIREBASE_EMULATORS_PATH = Join-Path (Get-Location) '.cache/firebase-emulators'
npm exec --yes --package firebase-tools@15.35.0 -- firebase emulators:start --project demo-udu-chat --only auth,database
```

Mở Emulator UI ở [localhost:4000](http://127.0.0.1:4000). Chạy kiểm tra trong terminal khác:

```powershell
node scripts/verify-firebase.cjs
node scripts/verify-firebase.cjs --demo
```

Lệnh đầu xác minh nhiều tài khoản, tin realtime, phân trang và thao tác bị Rules từ chối. Lệnh thứ hai chuẩn bị phòng demo và ba tài khoản `an@example.test`, `binh@example.test`, `linh@example.test`. Mật khẩu thử là `UduDemo600`. Tin ảnh demo dùng URL ảnh công khai đã có trên Cloudinary.

Để kết nối app debug, bật `enabled: true` trong `src/services/firebaseEmulatorConfig.ts`, sau đó tải lại JavaScript qua Metro. Chạy cho từng thiết bị Android:

```powershell
adb reverse tcp:8081 tcp:8081
adb reverse tcp:9000 tcp:9000
adb reverse tcp:9099 tcp:9099
```

Chỉ bật cấu hình này khi thử Firebase cục bộ. Luồng dùng Cloudinary vẫn yêu cầu cấu hình preset thật.

## Cấu trúc và hành vi

| Nhánh Realtime Database | Nội dung |
| --- | --- |
| `conversations/{id}` | Loại phòng, tên, thành viên, người và thời điểm tạo |
| `chats/{id}/messages/{key}` | Tin nhắn, ảnh theo URL, tọa độ, cờ thu hồi và cảm xúc theo UID |
| `userChats/{uid}/{id}` | ID tin cuối, người gửi, thời điểm cập nhật, số chưa đọc riêng |
| `readStatus/{id}/{uid}` | ID và thời điểm tin cuối đã đọc, thời điểm xem |
| `typing/{id}/{uid}/{session}` | Dấu thời gian gõ tự hết hạn sau 3 giây |
| `activeChats/{id}/{uid}/{session}` | Phòng đang hiển thị ở foreground, dùng để gửi thông báo |
| `presence/{uid}` | Kết nối online theo thiết bị và thời điểm hoạt động cuối |
| `notifications/{uid}/{key}` | Lời mời nhóm, tin mới, cảm xúc và cờ đã đọc |

Dữ liệu tin giữ đường dẫn Bài 5 để bảo toàn lịch sử. Lần đầu mở lại phòng trực tiếp cũ, app nâng cấp metadata và chỉ mục, bắt đầu theo dõi lượt đọc và số chưa đọc theo mô hình Bài 6. Home nghe truy vấn một tin mới nhất của từng phòng để tin cuối thu hồi đổi ngay. Màn hình chat lấy 20 tin mới nhất, rồi lấy các trang cũ theo cặp thời gian và ID.

`src/services/` chứa giao tiếp Firebase và Cloudinary. Gửi tin dùng một `update()` gốc cho tin mới, chỉ mục, `increment(1)` cho từng người nhận và thông báo tin mới. Cờ hoạt động và đang soạn dùng session riêng cho mỗi kết nối. `onDisconnect` dọn session và cập nhật thời điểm online cuối. Ở chat nhóm, **Đã xem** hiển thị thời điểm xem mới nhất trong các thành viên đã đọc.

## Kiểm tra và minh chứng

```powershell
npm run lint
node node_modules/typescript/bin/tsc --noEmit
npm test -- --runInBand
node scripts/verify-firebase.cjs
```

Khi dùng dự án thật, chụp **Realtime Database → Data** với `conversations` và `userChats` và **Rules** sau khi Publish. Dùng ba tài khoản để quay luồng nhóm, đang soạn, đã xem, thu hồi, gửi ảnh và badge.
