import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SafeAreaView } from "react-native-safe-area-context";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showImage?: boolean; // 상점 페이지용 이미지 표시 여부
}

export default function Header({
  title,
  showBack = true,
  showImage = false,
}: HeaderProps) {
  const navigation = useNavigation<any>(); // 타입 지정

  const handleImagePress = () => {
    navigation.navigate("UseCoupon");
  };

  return (
    <SafeAreaView className="bg-[#101010] py-5" edges={["top"]}>
      <View className="flex-row items-center justify-center px-4">
        {/* 뒤로가기 */}
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <MaterialIcons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>
        )}

        {/* 타이틀 */}
        <View className="flex-1 items-center mr-6">
          <Text className="text-white text-[16px] font-bold">{title}</Text>
        </View>

        {/* 상점 이미지 또는 공간 유지 */}
        {showImage ? (
          <TouchableOpacity onPress={handleImagePress}>
            <Image
              source={require("assets/images/store/UseCoupon.png")}
              className="w-[22px] h-[18px]"
            />
          </TouchableOpacity>
        ) : (
          <View className="w-[22px] h-[18px]" />
        )}
      </View>
    </SafeAreaView>
  );
}
