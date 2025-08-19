import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "App"; // 네비게이션 타입 선언한 곳

interface CouponItemProps {
  image: any;
  storeName: string;
  title: string;
  purchaseDate: string;
  expireDate: string;
  status: "사용 가능" | "사용 완료" | "기간 만료";
}

export default function CouponList({
  image,
  storeName,
  title,
  purchaseDate,
  expireDate,
  status,
}: CouponItemProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<StoreStackParamList>>();

  const statusColor =
    status === "사용 완료"
      ? "#F9E482"
      : status === "기간 만료"
      ? "#B8DDFF"
      : "#E9690D";

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("UseCouponDetail", {
          coupon: {
            name: storeName,
            product: title,
            purchaseDate,
            expireDate,
            status,
            image,
          },
        })
      }
    >
      <View className="flex-row justify-between mt-6">
        <Image source={image} className="w-[121px] h-[80px] rounded-lg" />
        <View className="justify-center flex-1 ml-3">
          <Text className="text-[#7B7B7B] text-[11px]">{storeName}</Text>
          <Text className="text-white font-bold text-[16px] my-1">{title}</Text>
          <Text className="text-[#7B7B7B] text-[11px] mb-0.5">
            구매일 {purchaseDate}
          </Text>
          <Text className="text-[#D1D1D1] text-[11px]">
            만료일 {expireDate}
          </Text>
        </View>
        <Text style={{ color: statusColor }} className="text-[8px] font-black">
          {status}
        </Text>
      </View>
      <View className="w-full h-[0.5px] bg-[#999999] mt-6" />
    </TouchableOpacity>
  );
}
