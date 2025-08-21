import { View, Text } from "react-native";
import React, { useRef, useMemo } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export default function WalkingDetail({
  elapsed,
  formatted,
}: {
  elapsed: number;
  formatted: string;
}) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["7%", "50%"], []);

  const displayTime = (seconds: number) => {
    // const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    // const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    // const s = String(seconds % 60).padStart(2, "0");
    // return `${h}:${m}:${s}`;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}min`;
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      backgroundStyle={{
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{ backgroundColor: "#00000020" }}>
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 15,
          paddingBottom: 20,
        }}>
        <View className="justify-center">
          {/* 거리 */}
          <View className="mb-5">
            <Text className="text-[#7C7C7C] font-bold text-base">거리</Text>
            <Text className="text-black text-[41px] font-bold">0km</Text>
          </View>

          {/* 페이스 / 시간 / 칼로리 */}
          <View className="w-screen flex-row justify-between">
            <View className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">페이스</Text>
              <Text className="text-orange-500 text-xl font-semibold">
                0 km/h
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">시간</Text>
              <Text className="text-orange-500 text-xl font-semibold">
                {displayTime(elapsed)}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">칼로리</Text>
              <Text className="text-orange-500 text-xl font-semibold">
                0 kcal
              </Text>
            </View>
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
