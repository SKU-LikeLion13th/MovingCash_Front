import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CouponList from "./CuponList";

export default function Coupon_Owned() {
  return (
    <View className="px-5">
      {/* 상단 필터 */}
      <View className="flex-row items-center justify-between my-5">
        <Text className="text-[#999999] text-[12px]">총 1개</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#B1B1B1] font-bold mr-0.5 text-[11px]">
            신규 등록순
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#B1B1B1" />
        </TouchableOpacity>
      </View>

      <View className="w-full h-[0.5px] bg-[#999999]" />

      {/* 쿠폰 목록 */}
      <CouponList
        image={require("assets/images/store/Nearby/Nearby_1.png")}
        storeName="나들가게 한양슈퍼"
        title="상품권 20,000권"
        purchaseDate="2025-08-10"
        expireDate="2025-09-10"
        status="사용 가능"
      />
    </View>
  );
}
