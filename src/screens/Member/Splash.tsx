import React from "react";
import { View, Text, Image } from "react-native";

export default function Splash() {

  return (
    <View className="flex flex-1 justify-center items-center bg-[#101010]">
      <Image
        source={require("../../../assets/images/splash.png")}
        className="mb-8 w-44 h-44"
        resizeMode="contain"
      />
    </View>
  );
}
