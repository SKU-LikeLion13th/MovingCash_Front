import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

export default function Header({ title, showBack = true }: HeaderProps) {
  const navigation = useNavigation();

  return (
    <View className="flex-row items-center py-6 mt-10">
      {showBack && (
        <TouchableOpacity onPress={() => navigation.goBack()} className="ml-4">
          <MaterialIcons name="arrow-back" size={30} color="white" />
        </TouchableOpacity>
      )}

      <View className="flex-1 items-center right-5">
        <Text className="text-white text-[16px] font-bold">{title}</Text>
      </View>
    </View>
  );
}
