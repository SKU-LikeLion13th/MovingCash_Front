import { View, Text } from "react-native";
import React, { useRef, useMemo } from "react";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

export default function WalkingDetail() {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["15%", "30%", "50%"], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      style={{
        zIndex: 50,
        elevation: 50,
      }}
      backgroundStyle={{
        backgroundColor: "#ffffff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{ backgroundColor: "#00000020" }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 32,
          paddingTop: 15,
          paddingBottom: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="justify-center">
          <View className="mb-5">
            <Text className="text-[#7C7C7C] font-bold text-base">거리</Text>
            <Text className="text-black text-[41px] font-bold">0km</Text>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">페이스</Text>
              <Text className="text-orange-500 text-xl font-semibold">
                0 km/h
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-gray-500 text-sm mb-1">시간</Text>
              <Text className="text-orange-500 text-xl font-semibold">
                0h 0min
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
