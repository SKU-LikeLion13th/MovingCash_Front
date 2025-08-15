// Bar.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { SvgProps } from 'react-native-svg';
import React from 'react';
import { RootTabParamList } from '../../App';

import PointIcon from '../../assets/icons/pointBtn.svg';
import StoreIcon from '../../assets/icons/shopBtn.svg';
import HomeIcon from '../../assets/icons/mainBtn.svg';
import UserIcon from '../../assets/icons/mypageBtn.svg';

const tabConfig: Record<keyof RootTabParamList, {
  label: string;
  Icon: React.FC<SvgProps & { fill?: string; stroke?: string }>;
  type: 'fill' | 'stroke';
}> = {
  MainTab:   { label: '메인',     Icon: HomeIcon,  type: 'fill' },
  StoreTab:  { label: '상점',     Icon: StoreIcon, type: 'fill' },
  PointTab:  { label: '포인트',   Icon: PointIcon, type: 'stroke' },
  MyPageTab: { label: '마이페이지', Icon: UserIcon,  type: 'stroke' },
  StartTab:  { label: '시작',     Icon: HomeIcon, type: 'fill' },
};

export default function Bar({ state, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const cfg = tabConfig[route.name as keyof RootTabParamList];

        if (!cfg) {
          console.warn(`tabConfig에 ${route.name} 키가 없어요`);
          return null;
        }

        const { Icon, label, type } = cfg;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? '#E9690D' : '#999999';

        return (
          <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabButton}>
            <View style={styles.iconContainer}>
              {type === 'stroke' ? (
                <Icon stroke={color} fill="none" />
              ) : (
                <Icon fill={color} />
              )}
              <Text style={{ color, fontSize: 12, marginTop: 3 }}>{label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#101010',
    borderTopWidth: 1,
    borderTopColor: '#222222',
  },
  tabButton: { flex: 1, alignItems: 'center' },
  iconContainer: { alignItems: 'center', width: 60 },
});
