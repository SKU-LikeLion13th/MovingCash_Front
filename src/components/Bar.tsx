import { View, Text, TouchableOpacity, Image } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { SvgProps } from "react-native-svg";
import React from "react";
import { RootTabParamList } from "../../App";

import HomeIcon from "../../assets/icons/mainBtn.svg";
type TabCfg = {
  label: string;
  Icon?: React.FC<SvgProps & { fill?: string; stroke?: string }>;
  img?: any;
  type?: "fill" | "stroke"; 
  variant?: "main" | "default";
};

const tabConfig: Record<keyof RootTabParamList, TabCfg> = {
  MainTab:   { label: "메인",     Icon: HomeIcon,  type: "fill", variant: "main" },
  StoreTab:  { label: "상점",     img: require("../../assets/images/Bar/Shop.png") },
  PointTab:  { label: "포인트",   img: require("../../assets/images/Bar/point.png") },
  MyPageTab: { label: "마이페이지", img: require("../../assets/images/Bar/user.png") },
};

export default function Bar({ state, navigation }: BottomTabBarProps) {
  return (
    <View className="flex-row justify-around py-5 pb-8 bg-[#101010]">
      {state.routes.map((route, index) => {
        const cfg = tabConfig[route.name as keyof RootTabParamList];
        if (!cfg) return null;

        const { Icon, img, label, type, variant } = cfg;
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

        // 메인 전용 (네가 쓰던 스타일 최대 유지)
        if (variant === "main") {
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="flex-1 items-center -mt-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View
                className={[
                  "w-20 h-14 rounded-2xl items-center justify-center shadow-lg",
                  isFocused ? "bg-[#261910]" : "bg-[#303030]",
                ].join(" ")}
                style={{ elevation: 8 }}
              >
                {Icon ? (
                  <Icon width={28} height={28} fill={color} />
                ) : img ? (
                  <Image
                    source={img}
                    style={{ width: 28, height: 28, tintColor: color }}
                    resizeMode="contain"
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }

        // 기본 탭: 이미지 있으면 이미지 + tint, 없으면 SVG
        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center"
          >
            <View className="items-center w-[60px]">
              {img ? (
                <Image
                  source={img}
                  style={{ width: 28, height: 28, tintColor: color }}
                  resizeMode="contain"
                />
              ) : Icon ? (
                type === "stroke" ? (
                  <Icon stroke={color} fill="none" width={28} height={28} />
                ) : (
                  <Icon fill={color} width={28} height={28} />
                )
              ) : null}

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
