import React from "react";
import { View, Pressable, Text, ViewStyle } from "react-native";

type Props = {
  onReset: () => void | Promise<void>;
  onLocate: () => void;
  variant?: "sheetFloat" | "overlay";
  showReset?: boolean; //리셋 버튼 보이기/숨기기
  style?: ViewStyle;
};

export default function MapActionButtons({
  onReset,
  onLocate,
  variant = "overlay",
  showReset = true,
  style,
}: Props) {
  const isSheet = variant === "sheetFloat";

  if (isSheet) {
    return (
      <View
        style={style}
        className="relative w-full bg-[#1A1A1C] pt-2 pb-3 rounded-t-3xl"
      >
        {/* 손잡이 바 */}
        <View className="items-center mb-2">
          <View className="w-10 h-[5px] rounded-full bg-white/50" />
        </View>

        {/* 떠 있는 버튼 묶음*/}
        <View
          className={`absolute -top-[60px] right-4 flex-row items-center ${
            showReset ? "space-x-2" : ""
          }`}
          style={{ zIndex: 60, elevation: 60 }}
        >
          {/* 리셋 (옵션) */}
          {showReset && (
            <Pressable
              onPress={onReset}
              accessibilityLabel="추천 장소 초기화"
              className="w-12 h-12 rounded-2xl bg-[#1A1A1C] items-center justify-center"
            >
              <Text className="text-white text-[12px] font-bold">리셋</Text>
            </Pressable>
          )}
          {/* 현재 위치 */}
          <Pressable
            onPress={onLocate}
            accessibilityLabel="현재 위치로 이동"
            className="w-12 h-12 rounded-2xl bg-[#1A1A1C] items-center justify-center"
          >
            <Text className="text-white text-xl">➤</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={style} className="absolute left-4 right-4 bottom-5">
      {showReset ? (
        <View className="flex-row justify-center space-x-3">
          <Pressable
            onPress={onLocate}
            className="flex-1 h-11 rounded-full bg-black/80 items-center justify-center"
          >
            <Text className="text-white font-bold">현재 위치</Text>
          </Pressable>
          <Pressable
            onPress={onReset}
            className="flex-1 h-11 rounded-full bg-[#2E2E31] items-center justify-center"
          >
            <Text className="text-white font-bold">초기화</Text>
          </Pressable>
        </View>
      ) : (
        <View
          className={`absolute -top-[120px] right-0 flex-row items-center ${
            showReset ? "space-x-2" : ""
          }`}
          style={{ zIndex: 60, elevation: 60 }}
        >
          {/* 현재 위치 */}
          <Pressable
            onPress={onLocate}
            accessibilityLabel="현재 위치로 이동"
            className="w-12 h-12 rounded-2xl bg-[#1A1A1C] items-center justify-center"
          >
            <Text className="text-white text-xl">➤</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
