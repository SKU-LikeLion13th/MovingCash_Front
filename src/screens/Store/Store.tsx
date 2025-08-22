import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Header from "src/components/Header";
import Nearby, { NearbyBanner } from "./Nearby";
import Membership, { MembershipBanner } from "./Membership";
import Goods, { GoodsBanner } from "./Goods";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { StoreStackParamList } from "App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Store() {
  const [activeTab, setActiveTab] = useState<"nearby" | "membership" | "goods">(
    "nearby"
  );
  const [textWidths, setTextWidths] = useState<{ [key: string]: number }>({});

  const tabs = [
    { key: "nearby", label: "내 주변" },
    { key: "membership", label: "회원권" },
    { key: "goods", label: "굿즈" },
  ];

  const navigation =
    useNavigation<NativeStackNavigationProp<StoreStackParamList>>();

  const renderBanner = () => {
    switch (activeTab) {
      case "nearby":
        return <NearbyBanner />;
      case "membership":
        return <MembershipBanner />;
      case "goods":
        return <GoodsBanner />;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "nearby":
        return <Nearby navigation={navigation} />;
      case "membership":
        return <Membership navigation={navigation} />;
      case "goods":
        // navigation={navigation}
        return <Goods />;
      default:
        return null;
    }
  };

  const [point, setPoint] = useState<number>(0);

  useEffect(() => {
    const fetchPoint = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
          return;
        }

        const response = await fetch(
          "http://movingcash.sku-sku.com/sessions/getPointAndStep",
          {
            method: "GET",
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "API 호출 실패:",
            response.status,
            await response.text()
          );
          return;
        }

        const data = await response.json();
        setPoint(data.point);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchPoint();
  }, []);

  return (
    <View className="h-full bg-[#101010]">
      <Header title="상점" showImage={true} />

      {/* 배너 */}
      <View>{renderBanner()}</View>

      {/* 탭 버튼 */}
      <View className="flex-row justify-center space-x-4 mt-3">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
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

      {/* 내 포인트 */}
      <View className="flex-row space-x-2 items-center justify-center mt-4 mb-7">
        <Image
          source={require("../../../assets/images/store/point.png")}
          className="w-[14px] h-[14px]"
        />
        <Text className="text-white"> {point.toLocaleString()}</Text>
      </View>

      {/* 탭별 컨텐츠 */}
      <View className="flex-1">{renderContent()}</View>
    </View>
  );
}
