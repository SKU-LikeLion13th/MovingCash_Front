import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Header from "src/components/Header";
import Coupon_Owned from "./Coupon_Owned";
import Coupon_Used from "./Coupon_Used";

export default function UseCoupon() {
  const [activeTab, setActiveTab] = useState<"Owned" | "Used">("Owned");
  const [textWidths, setTextWidths] = useState<{ [key: string]: number }>({});

  const tabs = [
    { key: "Owned", label: "보유" },
    { key: "Used", label: "사용/만료" },
  ];

  return (
    <View className="h-full bg-[#101010]">
      <Header title="상점" showImage={true} />
      {/* 탭 */}
      <View className="flex-row justify-center space-x-4 mt-3">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as "Owned" | "Used")}
          >
            <View className="items-center">
              <Text
                className={
                  activeTab === tab.key
                    ? "text-white font-black"
                    : "text-white/30 font-bold"
                }
                onLayout={(e) => {
                  const { width } = e.nativeEvent.layout;
                  setTextWidths((prev) => ({ ...prev, [tab.key]: width }));
                }}
              >
                {tab.label}
              </Text>

              {/* 밑줄 */}
              {activeTab === tab.key && textWidths[tab.key] && (
                <View
                  style={{
                    height: 2,
                    backgroundColor: "#E9690D",
                    width: textWidths[tab.key],
                    marginTop: 3,
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <View className="flex-1">
        {activeTab === "Owned" ? <Coupon_Owned /> : <Coupon_Used />}
      </View>
    </View>
  );
}
