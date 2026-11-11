import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { NavigationContainer } from '@react-navigation/native';
import { ThoiTietHienTai } from '../src/components/ThoiTietHienTai';
import { ThoiTietTheoGio } from '../src/components/ThoiTietTheoGio';
import { ThoiTietTheoNgay } from '../src/components/ThoiTietTheoNgay';
import { HomeScreen } from '../src/screens/HomeScreen';

describe('Weather Components', () => {
  it('renders ThoiTietHienTai with default values', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(<ThoiTietHienTai />);
    });
    expect(tree).toBeDefined();
  });

  it('renders ThoiTietTheoGio with default and custom props', async () => {
    let treeDefault;
    let treeCustom;
    await ReactTestRenderer.act(async () => {
      treeDefault = ReactTestRenderer.create(<ThoiTietTheoGio />);
      treeCustom = ReactTestRenderer.create(
        <ThoiTietTheoGio time="12 giờ" status="Nắng" temp="30°C" />,
      );
    });
    expect(treeDefault).toBeDefined();
    expect(treeCustom).toBeDefined();
  });

  it('renders ThoiTietTheoNgay with default and custom props', async () => {
    let treeDefault;
    let treeCustom;
    await ReactTestRenderer.act(async () => {
      treeDefault = ReactTestRenderer.create(<ThoiTietTheoNgay />);
      treeCustom = ReactTestRenderer.create(
        <ThoiTietTheoNgay time="14 giờ" status="Mây" temp="28°C" />,
      );
    });
    expect(treeDefault).toBeDefined();
    expect(treeCustom).toBeDefined();
  });

  it('renders HomeScreen correctly', async () => {
    let tree;
    await ReactTestRenderer.act(async () => {
      tree = ReactTestRenderer.create(
        <NavigationContainer>
          <HomeScreen />
        </NavigationContainer>,
      );
    });
    expect(tree).toBeDefined();
  });
});
