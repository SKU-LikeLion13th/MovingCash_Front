import { View, Text } from "react-native";
import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

export default function WalkingPoints() {
  return (
    <View className="my-8">
      {/* 현재 보유 포인트 */}
      <View className="flex-row items-center justify-center">
        <Text className="text-white font-notoSemiBold text-[13px]">
          현재 보유 포인트
        </Text>

        <Svg width="13" height="13" viewBox="0 0 15 15" className="ml-3 mr-1.5">
          <Circle
            cx="7.35403"
            cy="7.816"
            r="6.77388"
            stroke="#E9690D"
            strokeWidth="1.04214"
            fill="none"
          />
          <Path
            d="M10.6975 7.03944C10.6975 7.46324 10.6002 7.8523 10.4057 8.20663C10.2112 8.55401 9.91243 8.83538 9.50947 9.05076C9.10651 9.26613 8.60628 9.37382 8.00879 9.37382H6.90413V12H5.12208V4.68421H8.00879C8.59239 4.68421 9.08567 4.78495 9.48863 4.98643C9.89158 5.18791 10.1938 5.46581 10.3953 5.82014C10.5968 6.17446 10.6975 6.5809 10.6975 7.03944ZM7.87332 7.95652C8.21375 7.95652 8.46733 7.87662 8.63407 7.71682C8.80082 7.55703 8.88419 7.33123 8.88419 7.03944C8.88419 6.74764 8.80082 6.52184 8.63407 6.36205C8.46733 6.20226 8.21375 6.12236 7.87332 6.12236H6.90413V7.95652H7.87332Z"
            fill="#E9690D"
          />
        </Svg>

        <Text className="text-white font-notoSemiBold text-[13px]">32,100</Text>
      </View>

      {/* 오늘의 러닝 적립 포인트 */}
      <View className="flex-row items-center justify-center mt-1">
        <Text className="text-white font-notoSemiBold text-[13px]">
          오늘의 워킹 적립 포인트
        </Text>

        <Svg width="13" height="13" viewBox="0 0 15 15" className="ml-3 mr-1.5">
          <Circle
            cx="7.35403"
            cy="7.816"
            r="6.77388"
            stroke="#E9690D"
            strokeWidth="1.04214"
            fill="none"
          />
          <Path
            d="M10.6975 7.03944C10.6975 7.46324 10.6002 7.8523 10.4057 8.20663C10.2112 8.55401 9.91243 8.83538 9.50947 9.05076C9.10651 9.26613 8.60628 9.37382 8.00879 9.37382H6.90413V12H5.12208V4.68421H8.00879C8.59239 4.68421 9.08567 4.78495 9.48863 4.98643C9.89158 5.18791 10.1938 5.46581 10.3953 5.82014C10.5968 6.17446 10.6975 6.5809 10.6975 7.03944ZM7.87332 7.95652C8.21375 7.95652 8.46733 7.87662 8.63407 7.71682C8.80082 7.55703 8.88419 7.33123 8.88419 7.03944C8.88419 6.74764 8.80082 6.52184 8.63407 6.36205C8.46733 6.20226 8.21375 6.12236 7.87332 6.12236H6.90413V7.95652H7.87332Z"
            fill="#E9690D"
          />
        </Svg>

        <Text className="text-white font-notoSemiBold text-[13px]">70</Text>
      </View>
    </View>
  );
}
