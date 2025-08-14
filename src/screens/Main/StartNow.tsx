import React from "react";
import { View, Text, Image } from "react-native";

export default function StartNow() {
  return (
    <View>
      <Text className="text-white text-[15px] font-bold">
        지금 바로 시작하세요!
      </Text>

      {/* 이동 탭 */}
      <View>
        <View>
          <Image
            source={require("../../../assets/images/Walking.png")}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../../assets/images/Running.png")}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../../assets/images/MovingSpot.png")}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>
        <View>
          <Image
            source={require("../../../assets/images/MovingSpot.png")}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
