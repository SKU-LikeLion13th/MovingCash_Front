import React, { useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";

interface MovingData {
  calories: number;
  distance: number;
}

export default function RecentMoving() {
  const [mode, setMode] = useState<"Running" | "Walking">("Running");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<MovingData>({ calories: 0, distance: 0 });
  const [name, setName] = useState("User");
  const API_URL =
    Constants?.expoConfig?.extra?.apiUrl ?? "https://movingcash.sku-sku.com";

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 필요!");
        return;
      }

      const today = new Date();

      const toLocalDateTimeString = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}T00:00:00`;
      };

      const todayStr = toLocalDateTimeString(today);

      // 이번 주 월요일 ~ 일요일
      const dayOfWeek = today.getDay(); // 0=일 ~ 6=토
      const monday = new Date(today);
      monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const startDate = toLocalDateTimeString(monday);
      const endDate = toLocalDateTimeString(sunday);

      const status = mode === "Running" ? "RUNNING" : "WALKING";

      const response = await axios.post(
        `${API_URL}/mainPage`,
        { status, startDate, endDate, todayDate: todayStr },
        {
          headers: { Authorization: token, "Content-Type": "application/json" },
        }
      );

      const resData = response.data;
      setName(resData.name || "사용자");
      setData({
        calories: resData.totalCalories || 0,
        distance: resData.totalDistance || 0,
      });
    } catch (error: any) {
      console.error("API 호출 실패:", error.response || error.message);
    }
  };

  // 화면 포커스 시마다 fetchData 호출
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [mode]) // mode 바뀔 때도 다시 호출
  );

  return (
    <View className="relative">
      <View className="flex flex-row items-center justify-between mb-4">
        <Text className="text-white text-[15px] font-bold">
          {name}님의 최근 무빙
        </Text>

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
                  className="px-3 py-2"
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
        <View className="flex flex-row items-center">
          <Image
            source={require("../../../assets/images/Calories.png")}
            className="w-8 h-8"
          />
          <View className="ml-2">
            <Text className="text-[#E9690D] text-[12px]">Total Calories</Text>
            <Text className="text-white text-[22px] font-bold">
              {Math.floor(data.calories)} kcal
            </Text>
          </View>
        </View>

        <View className="w-[1px] h-12 bg-[#FFFFFF26] mx-6" />

        <View className="flex flex-row items-center">
          <Image
            source={require("../../../assets/images/routing.png")}
            className="w-8 h-8"
          />
          <View className="ml-2">
            <Text className="text-[#E9690D] text-[12px]">Total Distance</Text>
            <Text className="text-white text-[22px] font-bold">
              {Math.floor(data.distance)} km
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
