import React from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StoreStackParamList } from "App";
import Header from "src/components/Header";
import Feather from "@expo/vector-icons/Feather";

type Coupon = {
  storeName: string;
  name: string;
  product: string;
  title: string;
  purchaseDate: string;
  expireDate: string;
  status: "사용 가능" | "사용 완료" | "기간 만료";
  image: any;
};

type Props = NativeStackScreenProps<StoreStackParamList, "UseCouponDetail">;

export default function UseCouponDetail({ route }: Props) {
  const { coupon }: { coupon: Coupon } = route.params;

  function getRandom9DigitString(): string {
    return String(Math.floor(100000000 + Math.random() * 900000000));
  }

  return (
    <View className="h-full bg-[#101010]">
      <Header title="상점" showImage={true} />

      <View className="bg-white h-full rounded-t-3xl py-8 px-4">
        <View className="items-center mt-5">
          <Image
            source={coupon.image}
            className="w-[220px] h-[128px] rounded-lg"
          />
          <Text className="text-[#7B7B7B] text-[9px] mt-5">{coupon.name}</Text>
          <Text className="text-[#101010] text-[14px] font-semibold mt-3 mb-2">
            {coupon.product}
          </Text>
          <Image
            source={require("assets/images/Barcode.png")}
            className="w-[290px] h-[90px] my-4"
          />
          <TouchableOpacity className="border-[0.5px] w-[80%] rounded-sm border-[#999999] justify-center flex-row py-1 ">
            <Feather name="download" size={12} color={`#999999`} />
            <Text className="text-[#999999] text-[10px] ml-1">
              내 앨범에 저장
            </Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-2 mt-16">
          <View className="flex-row justify-between">
            <Text className="text-[15px] text-[#686868]">사용처</Text>
            <Text className="text-[15px] text-[#101010] font-semibold">
              {coupon.name}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[15px] text-[#686868]">유효기간</Text>
            <Text className="text-[15px] text-[#101010] font-semibold">
              2025년 09월 10일
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-[15px] text-[#686868]">주문번호</Text>
            <Text className="text-[15px] text-[#101010] font-semibold">
              {getRandom9DigitString()}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
