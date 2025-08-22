import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import Header from "src/components/Header";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StoreStackParamList } from "App";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Props = NativeStackScreenProps<StoreStackParamList, "ExchangeDetail">;

export default function ExchangeDetail({ route, navigation }: Props) {
  const { item } = route.params;
  const [agreed, setAgreed] = useState(false);
  const [exchanged, setExchanged] = useState(false);
  const [point, setPoint] = useState<number>(0);

  // 필요 포인트
  const neededPoints = parseInt(item.points.replace(/,/g, ""));

  // 교환 후 잔여 포인트 계산
  const remainingPoints = point - neededPoints;

  const handleExchange = () => {
    if (remainingPoints < 0) {
      Alert.alert("포인트 부족", "보유 포인트가 부족합니다.");
      return;
    }
    setExchanged(true);
    setPoint(remainingPoints); // ✅ 교환 후 즉시 반영
  };

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
      <View className="bg-white h-full rounded-t-3xl py-8 px-4">
        <View className="space-y-8">
          {exchanged ? (
            <View className="items-center mt-8 space-y-4">
              <Image
                source={require("assets/images/store/check.png")}
                className="w-[114px] h-[132px] mb-3"
              />
              <Text className="text-[18px] font-bold text-[#101010] mb-4">
                교환이 완료되었습니다!
              </Text>
              <View className="w-full h-[0.5px] bg-[#999999] my-4" />

              <View className="mt-4 space-y-2 w-full px-2">
                <View className="flex-row justify-between">
                  <Text className="text-[#686868] text-[15px]">사용처</Text>
                  <Text className="text-[#101010] text-[15px] font-semibold">
                    {item.name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[#686868] text-[15px]">유효 기간</Text>
                  <Text className="text-[#101010] text-[15px] font-semibold">
                    2025년 09월 10일
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[#686868] text-[15px]">
                    잔여 포인트
                  </Text>
                  <Text className="text-[#101010] text-[15px] font-semibold">
                    {point.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <>
              <Text className="text-[15px] font-semibold">
                교환하실 상품(1건)
              </Text>
              <View className="flex-row items-center mt-8">
                <Image
                  source={item.image}
                  className="w-[100px] h-[60px] rounded-lg"
                />
                <View className="ml-5 space-y-3">
                  <Text className="text-[10px] text-[#7b7b7b]">
                    {item.name}
                  </Text>
                  <Text className="text-[15px] text-[#101010] font-semibold">
                    {item.product}
                  </Text>
                </View>
              </View>
              <Text className="text-[#999999] text-[12px] my-8">
                30일 이내 사용 가능
              </Text>
              <View className="w-full h-[0.5px] bg-[#999999]" />

              <View className="mt-8 space-y-3 px-2">
                <View className="flex-row justify-between">
                  <Text className="text-[#686868] text-[15px]">
                    보유 포인트
                  </Text>
                  <Text className="text-[#101010] text-[15px] font-semibold">
                    {point.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[#686868] text-[15px]">
                    필요 포인트
                  </Text>
                  <Text className="text-[#101010] text-[15px] font-semibold">
                    {item.points}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-[#686868] text-[15px]">
                    잔여 포인트
                  </Text>
                  <Text className="text-[#101010] text-[15px] font-semibold">
                    {remainingPoints.toLocaleString()}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {!exchanged && (
          <View className="flex-row self-center mt-20">
            <View className="flex-col items-center">
              <View className="flex-row items-center">
                <Text onPress={() => setAgreed(!agreed)} className="mr-1">
                  <AntDesign
                    name="checkcircleo"
                    size={16}
                    color={agreed ? "#E9690D" : "#686868"}
                  />
                </Text>
                <Text className="text-[12px]">
                  상품 구매 후,{" "}
                  <Text className="text-[#E9690D] font-semibold">
                    유효기간 연장 및 환불 불가
                  </Text>{" "}
                  등
                </Text>
              </View>
              <View className="flex-row mt-1">
                <Text className="text-[12px] font-semibold underline">
                  구매시 유의 사항
                </Text>
                <Text className="text-[12px]">
                  을 확인했으며, 정보 제공에 동의합니다.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="flex-1 justify-end mb-24">
          <TouchableOpacity
            disabled={!agreed && !exchanged}
            onPress={() => {
              if (exchanged) {
                navigation.navigate("UseCouponDetail", { coupon: item });
              } else {
                handleExchange();
              }
            }}
            className={`py-4 rounded-xl items-center mb-4 ${
              agreed || exchanged ? "bg-[#E9690D]" : "bg-[#D9D9D9]"
            }`}
          >
            <Text
              className={`text-[16px] font-semibold ${
                agreed || exchanged ? "text-white" : "text-[#999999]"
              }`}
            >
              {exchanged ? "교환권 사용하기" : "교환하기"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
