import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

export default function Running() {
  const size = 180;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View className="flex-1 bg-[#101010] pt-16 px-3">
      <View className="flex-row justify-between items-center text-center">
        <Pressable className="">
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 11H9l3.29-3.29a1 1 0 0 0 0-1.42 1 1 0 0 0-1.41 0l-4.29 4.3A2 2 0 0 0 6 12h0a2 2 0 0 0 .59 1.4l4.29 4.3a1 1 0 1 0 1.41-1.42L9 13h10a1 1 0 0 0 0-2Z"
              fill="white" // 아이콘 색상
            />
          </Svg>
        </Pressable>
        <Text className="text-white text-2xl font-bold">Running</Text>
        <View className="w-10" /> {/* 상단 텍스트 중앙 배치하기 위해 */}
      </View>

      <Text className="text-center text-base text-white font-bold mt-10">
        무빙과 함께 뛰어볼까요?
      </Text>

      <View className="mt-10 items-center justify-center">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FF6F00"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.75}, ${circumference * 0.25}`}
          />
        </Svg>
        <Text className="absolute text-[43px] text-white font-bold">Start</Text>
      </View>
    </View>
  );
}
