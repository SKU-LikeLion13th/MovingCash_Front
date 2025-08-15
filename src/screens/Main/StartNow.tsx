import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { MainStackParamList } from "App";

export default function StartNow() {
const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const items = [
    {
      src: require("../../../assets/images/Walking.png"),
      label: "Walking",
      route: "Walking",
    },
    {
      src: require("../../../assets/images/Running.png"),
      label: "Running",
      route: "Running",
    },
    {
      src: require("../../../assets/images/MovingSpot.png"),
      label: "Challenge",
      route: "Challenge",
    },
    {
      src: require("../../../assets/images/MovingSpot.png"),
      label: "Moving spot",
      route: "MovingSpot",
    },
  ];

  return (
    <View>
      <Text className="text-white text-[15px] font-bold mb-4">
        지금 바로 시작하세요!
      </Text>

      <View className="flex flex-col space-y-6">
        {Array.from({ length: 2 }).map((_, rowIndex) => (
          <View key={rowIndex} className="flex flex-row justify-between ">
            {items.slice(rowIndex * 2, rowIndex * 2 + 2).map((item, index) => (
              <TouchableOpacity
                key={index}
                className="items-center bg-[#1F1F1F66] w-[48%] py-2.5 border border-[#FFFFFF26] rounded-xl"
                onPress={() => navigation.navigate(item.route as keyof MainStackParamList)}
              >
                <Image
                  source={item.src}
                  className="w-8 h-8 mb-1"
                  resizeMode="contain"
                />
                <Text className="text-white text-[10px] mt-1">
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
