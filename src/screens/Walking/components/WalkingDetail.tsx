import { View, Text } from "react-native";
import React from "react";

export default function WalkingDetail() {
  return (
    <View className="bg-white rounded-t-3xl px-8 py-8 justify-center">
      <View className="mb-5">
        <Text className="text-[#7C7C7C] font-bold text-base">거리</Text>
        <Text className="text-black text-[41px] font-bold">0km</Text>
      </View>

      <View className="w-screen flex-row justify-between">
        <View className="flex-1">
          <Text className="text-gray-500 text-sm mb-1">페이스</Text>
          <Text className="text-orange-500 text-xl font-semibold">0 km/h</Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-500 text-sm mb-1">시간</Text>
          <Text className="text-orange-500 text-xl font-semibold">0h 0min</Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-500 text-sm mb-1">칼로리</Text>
          <Text className="text-orange-500 text-xl font-semibold">0 kcal</Text>
        </View>
      </View>
    </View>
  );
}
