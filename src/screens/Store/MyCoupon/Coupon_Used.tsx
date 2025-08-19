import React from "react";
import { Text, View, TouchableOpacity, Image } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CouponList from "./CuponList";

export default function Coupon_Used() {
  return (
    <View className="px-5">
      {/* 상단 필터 */}
      <View className="flex-row items-center justify-between my-5">
        <Text className="text-[#999999] text-[12px]">총 5개</Text>
        <TouchableOpacity className="flex-row items-center">
          <Text className="text-[#B1B1B1] font-bold mr-0.5 text-[11px]">
            신규 등록순
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color="#B1B1B1" />
        </TouchableOpacity>
      </View>

      <View className="w-full h-[0.5px] bg-[#999999]" />

      <CouponList
        image={require("assets/images/store/Nearby/Nearby_4.png")}
        storeName="안양남부시장"
        title="지역 화폐 50,000원"
        purchaseDate="2025-08-02"
        expireDate="2025-09-02"
        status="사용 완료"
      />
      <CouponList
        image={require("assets/images/store/Nearby/Nearby_2.png")}
        storeName="한빛미트정육"
        title="상품권 30,000원권"
        purchaseDate="2025-07-20"
        expireDate="2025-08-20"
        status="사용 완료"
      />
      <CouponList
        image={require("assets/images/store/Nearby/Nearby_3.png")}
        storeName="빵집아저씨"
        title="교환권 10,000원"
        purchaseDate="2025-06-27"
        expireDate="2025-07-27"
        status="기간 만료"
      />
      <CouponList
        image={require("assets/images/store/Nearby/Nearby_6.png")}
        storeName="썰스티"
        title="교환권 10,000원권"
        purchaseDate="2025-06-03"
        expireDate="2025-07-03"
        status="기간 만료"
      />
    </View>
  );
}
