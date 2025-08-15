import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';

export default function Start() {
  const navigation = useNavigation();

  return (
    <View className="flex flex-1 justify-center items-center bg-[#E9690D]">
      <Image
        source={require("../../../assets/images/start.png")}
        className="mb-2 w-44 h-44"
        resizeMode="contain"
      />

      <TouchableOpacity
        className={`flex w-[80%] justify-center items-center py-3 rounded-3xl bg-[#FFFFFF]`}
        onPress={() => navigation.navigate('Main')}
      >
        <Text
          className={`font-bold text-[#000000]`}
        >
          시작하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
