import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Header from "src/components/Header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function PointMain() {
  return (
    <View className="h-full bg-[#101010]">
      <Header title="포인트" />
      <View className="bg-[#1F1F1F] h-full rounded-t-3xl">
        {/* 지금까지발급된총누적포인트 */}
        <View className="mt-10 items-center">
          <Text className="text-[#A3A3A3]">지금까지 발급된 총 누적 포인트</Text>
          <View className="flex flex-row items-center">
            <Text className="text-white">32,100P</Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </View>
          <View className="flex flex-row">
            <Text>더 받을 수 있는 포인트</Text>
            <TouchableOpacity>
              <Text>62,580 P</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
