import React from "react";
import { View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";

type ActivityType = "run" | "walk";

interface ActivityTitleProps {
  activity: ActivityType;
}

export default function ActivityTitle({ activity }: ActivityTitleProps) {
  const title = activity === "run" ? "Running" : "Walking";

  return (
    <View className="flex-row justify-between items-center text-center">
      <Pressable>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
          <Path
            d="M19 11H9l3.29-3.29a1 1 0 0 0 0-1.42 1 1 0 0 0-1.41 0l-4.29 4.3A2 2 0 0 0 6 12h0a2 2 0 0 0 .59 1.4l4.29 4.3a1 1 0 1 0 1.41-1.42L9 13h10a1 1 0 0 0 0-2Z"
            fill="white"
          />
        </Svg>
      </Pressable>
      <Text className="text-white text-2xl font-bold">{title}</Text>
      <View className="w-10" /> {/* 상단 텍스트 중앙 배치용 */}
    </View>
  );
}
