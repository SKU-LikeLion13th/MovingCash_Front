import { View, Text, Image } from "react-native";
import React from "react";
import { useRunning } from "../context/RunningContext";

export default function RunningDetail() {
  const { formatted, calories, distance, pace } = useRunning();

  return (
    <View className="pb-10 px-2 space-y-4">
      <View className="py-5 flex-row border border-[#FFFFFF18] rounded-2xl">
        <View className="flex-1 flex-row items-center px-7 border-r border-[#FFFFFF18]">
          <View className="flex items-center justify-center mr-3">
            <Image
              source={require("assets/images/Calories.png")}
              className="h-6 w-6"
            />
          </View>
          <View>
            <Text className="text-[#E9690D] text-xs font-poppinsRegular">
              Calories
            </Text>
            <Text className="text-white text-xl font-poppinsSemiBold">
              {Math.round(calories)} <Text className="text-lg">kcal</Text>
            </Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center px-7">
          <View className="flex items-center justify-center mr-3">
            <Image
              source={require("assets/images/routing.png")}
              className="h-6 w-6"
            />
          </View>
          <View>
            <Text className="text-[#E9690D] text-xs font-poppinsRegular">
              Distance
            </Text>
            <Text className="text-white text-xl font-poppinsSemiBold">
              {distance.toFixed(1)} <Text className="text-lg">km</Text>
            </Text>
          </View>
        </View>
      </View>

      <View className="py-5 flex-row border border-[#FFFFFF18] rounded-2xl">
        <View className="flex-1 flex-row items-center px-7 border-r border-[#FFFFFF18]">
          <View className="flex items-center justify-center mr-4">
            <Image
              source={require("assets/images/pace.png")}
              className="h-5 w-5"
              resizeMode="contain"
            />
          </View>
          <View>
            <Text className="text-[#E9690D] text-xs font-poppinsRegular">
              Pace
            </Text>
            <Text className="text-white text-xl font-poppinsSemiBold">
              {pace.toFixed(1)} <Text className="text-lg">km/h</Text>
            </Text>
          </View>
        </View>

        <View className="flex-1 flex-row items-center px-7">
          <View className="flex items-center justify-center mr-4">
            <Image
              source={require("assets/images/time.png")}
              className="h-5 w-5"
              resizeMode="contain"
            />
          </View>
          <View>
            <Text className="text-[#E9690D] text-xs font-poppinsRegular">
              Time
            </Text>
            <Text className="text-white text-xl font-poppinsSemiBold">
              {formatted}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
