import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";

export default function UsePoint() {
  const [selectedTab, setSelectedTab] = useState<"바코드" | "QR스캔">("바코드");

  return (
    <View className="bg-[#101010] h-full p-5 pt-20">
      {/* 토글 메뉴 */}
      <View className="flex-row bg-[#000000] rounded-full justify-between p-1 mb-10">
        {["바코드", "QR스캔"].map((tab) => (
          <TouchableOpacity
            key={tab}
            className={`flex-1 py-3 rounded-full items-center ${
              selectedTab === tab ? "bg-[#282828]" : "bg-transparent"
            }`}
            onPress={() => setSelectedTab(tab as "바코드" | "QR스캔")}
          >
            <Text
              className={`text-white font-semibold ${
                selectedTab === tab ? "text-white" : "text-[#999999]"
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View className="bg-white border-[2px] border-[#E9690D] rounded-2xl py-8 items-center">
        {selectedTab === "바코드" ? (
          <Image
            source={require("assets/images/Barcode.png")}
            className="w-[253px] h-[88px]"
          />
        ) : (
          <Image
            source={require("assets/images/QRcode.png")}
            className="w-[163px] h-[163px]"
          />
        )}

        <Text className="my-4 text-[#E9690D] font-semibold">00:12:00</Text>

        <View className="flex-row bg-[#F3F3F3] rounded-xl mx-4">
          {/* 충전하기 */}
          <TouchableOpacity className="flex-1 items-center justify-center py-4">
            <Text className="text-black font-semibold">충전하기</Text>
          </TouchableOpacity>

          {/* 구분선 */}
          <View className="w-px my-2 bg-[#DDDDDD]" />

          {/* 잔여포인트 확인하기 */}
          <TouchableOpacity className="flex-1 items-center justify-center py-4">
            <Text className="text-black font-semibold">
              잔여포인트 확인하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="text-white text-[15px] font-bold mb-4 mt-10">
        최근 사용내역
      </Text>
    </View>
  );
}
