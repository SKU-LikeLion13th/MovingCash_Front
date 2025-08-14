import React from "react";
import { View, Text, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RecentMoving() {
  return (
    <View>
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-white text-[15px] font-bold">
          호연님의 최근 무빙
        </Text>
        <Text className="text-white text-[12px]">Running</Text>
      </View>
      {/* 칼로리, 거리 */}
      <View className="border border-[#4E4E4E] flex flex-row items-center p-5 rounded-2xl">
        {/* 칼로리 */}
        <View className="flex flex-row">
          {/* 이미지 */}
          <Image
            source={require("../../../assets/images/Calories.png")}
            className="w-8 h-8"
          />
          <View className="ml-2">
            <Text className="text-[#E9690D] text-[12px]">Total Calories</Text>
            <Text className="text-white text-[22px] font-bold">546 kcal</Text>
          </View>
        </View>
        <View className="w-[1px] h-12 bg-[#4E4E4E] mx-6" />
        {/* 거리 */}
        <View className="flex flex-row">
          {/* 이미지 */}
          <Image
            source={require("../../../assets/images/routing.png")}
            className="w-8 h-8"
          />
          <View className="ml-2">
            <Text className="text-[#E9690D] text-[12px]">Total Distance</Text>
            <Text className="text-white text-[22px] font-bold">3,5 km</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
