import React from 'react';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './src/screens/HomeScreen';
import { WeatherScreen } from './src/screens/WeatherScreen';
import { DangNhap } from './src/screens/DangNhap';
import { DoanChat } from './src/screens/DoanChat';
import type { DanhSachManHinh } from './src/commons/dieuHuong';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BaiTapChat } from './src/baiTapChat';

const Stack = createNativeStackNavigator<DanhSachManHinh>();
type ManHinhGoc = { BaiTapChat: undefined; DuAnCu: undefined };
const RootStack = createNativeStackNavigator<ManHinhGoc>();

const ManHinhBaiTapChat = ({
  navigation,
}: NativeStackScreenProps<ManHinhGoc, 'BaiTapChat'>) => (
  <BaiTapChat moDuAnCu={() => navigation.navigate('DuAnCu')} />
);

const DuAnCu = () => (
  <Stack.Navigator
    initialRouteName="DangNhap"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="DangNhap" component={DangNhap} />
    <Stack.Screen name="DoanChat" component={DoanChat} />
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Weather" component={WeatherScreen} />
  </Stack.Navigator>
);

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName="BaiTapChat"
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen name="BaiTapChat" component={ManHinhBaiTapChat} />
          <RootStack.Screen
            name="DuAnCu"
            component={DuAnCu}
            options={{
              headerShown: true,
              title: 'Dự án ban đầu',
              headerTintColor: '#11776B',
            }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
