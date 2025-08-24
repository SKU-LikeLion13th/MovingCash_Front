import { View, Text, TouchableOpacity } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SvgProps } from "react-native-svg";
import React from "react";
import { RootTabParamList } from "../../App";

import PointIcon from "../../assets/icons/pointBtn.svg";
import StoreIcon from "../../assets/icons/shopBtn.svg";
import HomeIcon from "../../assets/icons/mainBtn.svg";
import UserIcon from "../../assets/icons/mypageBtn.svg";

type TabCfg = {
  label: string;
  Icon: React.FC<SvgProps & { fill?: string; stroke?: string }>;
  type: "fill" | "stroke";
  variant?: "main" | "default";
};

const tabConfig: Record<keyof RootTabParamList, TabCfg> = {
  MainTab:  { label: "메인",    Icon: HomeIcon,  type: "fill",   variant: "main" },
  StoreTab: { label: "상점",    Icon: StoreIcon, type: "fill" },
  PointTab: { label: "포인트",  Icon: PointIcon, type: "stroke" },
  MyPageTab:{ label: "마이페이지", Icon: UserIcon, type: "stroke" },
};

export default function Bar({ state, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row justify-around py-5 pb-8 bg-[#101010]">
      {state.routes.map((route, index) => {
        const cfg = tabConfig[route.name as keyof RootTabParamList];
        if (!cfg) return null;

        const { Icon, label, type, variant } = cfg;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const color = isFocused ? "#E9690D" : "#999999";

        // 메인 전용 (둥근 FAB + 떠있는 효과)
        if (variant === "main") {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center -mt-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                className={`w-20 h-14 rounded-2xl bg-[#261910] items-center justify-center shadow-lg 
                }`}
              >
                <Icon width={28} height={28} fill={color} />
              </View>
            </TouchableOpacity>
          ); 
        }

        // 기본 탭
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center"
          >
            <View className="items-center w-[60px]">
              {type === "stroke" ? (
                <Icon stroke={color} fill="none" />
              ) : (
                <Icon fill={color} />
              )}
              <Text className="mt-[3px] text-[12px]" style={{ color }}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
