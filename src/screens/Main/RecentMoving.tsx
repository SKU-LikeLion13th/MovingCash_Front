import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function RecentMoving() {
  const [mode, setMode] = useState<"Running" | "Walking">("Running");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ calories: 0, distance: 0 });

  useEffect(() => {
    const fetchData = async () => {
      // 예시 데이터
      const result = {
        Running: { calories: 546, distance: 3.5 },
        Walking: { calories: 320, distance: 2.1 },
      };
      setData(result[mode]);
    };
    fetchData();
  }, [mode]);

  return (
    <View className="relative">
      <View className="flex flex-row justify-between items-center mb-4">
        <Text className="text-white text-[15px] font-bold">
          호연님의 최근 무빙
        </Text>

        {/* 드롭다운 버튼 */}
        <View>
          <TouchableOpacity
            className="flex flex-row items-center"
            onPress={() => setOpen(!open)}
          >
            <Text className="text-[#B1B1B1] font-bold mr-1 text-[11px]">
              {mode}
            </Text>
            <MaterialIcons
              name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={20}
              color={`#B1B1B1`}
            />
          </TouchableOpacity>

          {open && (
            <View className="absolute bg-[#1F1F1F] rounded-xl z-10">
              {["Running", "Walking"].map((item) => (
                <TouchableOpacity
                  key={item}
                  className="py-2 px-3"
                  onPress={() => {
                    setMode(item as "Running" | "Walking");
                    setOpen(false);
                  }}
                >
                  <Text className="text-white text-[11px]">{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 칼로리, 거리 */}
      <View className="border border-[#FFFFFF26] flex flex-row items-center p-5 rounded-2xl">
        {/* 칼로리 */}
        <View className="flex flex-row items-center">
          <Image
            source={require("../../../assets/images/Calories.png")}
            className="w-8 h-8"
          />
          <View className="ml-2">
            <Text className="text-[#E9690D] text-[12px]">Total Calories</Text>
            <Text className="text-white text-[22px] font-bold">
              {data.calories} kcal
            </Text>
          </View>
        </View>

        {/* 구분선 */}
        <View className="w-[1px] h-12 bg-[#FFFFFF26] mx-6" />

        {/* 거리 */}
        <View className="flex flex-row items-center">
          <Image
            source={require("../../../assets/images/routing.png")}
            className="w-8 h-8"
          />
          <View className="ml-2">
            <Text className="text-[#E9690D] text-[12px]">Total Distance</Text>
            <Text className="text-white text-[22px] font-bold">
              {data.distance} km
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
