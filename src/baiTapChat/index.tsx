import React from 'react';
import { StatusBar } from 'react-native';
import { ChatProvider } from './state/ChatContext';
import { ChatStack } from './navigation/ChatStack';

export const BaiTapChat = ({ moDuAnCu }: { moDuAnCu?: () => void }) => (
  <ChatProvider moDuAnCu={moDuAnCu}>
    <StatusBar barStyle="dark-content" />
    <ChatStack />
  </ChatProvider>
);
