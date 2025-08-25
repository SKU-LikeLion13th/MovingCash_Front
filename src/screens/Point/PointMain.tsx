import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Header from "src/components/Header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MainStackParamList } from "App";
import Constants from "expo-constants";

export default function PointMain() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const [point, setPoint] = useState<number>(0);
  const API_URL = Constants?.expoConfig?.extra?.apiUrl ?? "http://movingcash.sku-sku.com";

  const missions = [
    {
      textSmall: "매일 10,000보 걷고",
      textBig: "100원 받기",
      time: "09:22:24",
      image: require("../../../assets/images/sneakers.png"),
      imageWidth: 160,
      imageHeight: 80,
      btnText: "포인트 받기",
      btnBg: "#E9690D",
      btnTextColor: "#ffffff",
    },
    {
      textSmall: "안양시 산책 스팟 산책하고",
      textBig: "300원 받기",
      time: "07:22:10",
      image: require("../../../assets/images/nature.png"),
      imageWidth: 140,
      imageHeight: 140,
      btnText: "달성 가능",
      btnBg: "#DBDBDB",
      btnTextColor: "#707070",
    },
  ];

  useEffect(() => {
    const fetchPoint = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
          return;
        }

        const response = await fetch(
          `${API_URL}/sessions/getPointAndStep`,
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
      <Header title="포인트" />
      <View className="bg-[#1F1F1F] h-full rounded-t-3xl">
        {/* 지금까지 발급된 총 누적 포인트 */}
        <View className="mt-10 items-center">
          <Text className="text-[#A3A3A3] font-semibold">
            지금까지 발급된 총 누적 포인트
          </Text>
          <View className="flex flex-row items-center my-4">
            <Text className="text-white text-[30px] mr-2 font-black">
              {point.toLocaleString()} P
            </Text>
            <MaterialIcons
              name="keyboard-arrow-right"
              size={24}
              color="white"
            />
          </View>
          <View className="flex flex-row">
            <Text className="text-[#A3A3A3] font-light mr-1">
              더 받을 수 있는 포인트
            </Text>
            <TouchableOpacity>
              <Text
                className="font-bold text-[#E9690D] underline"
                onPress={() => navigation.navigate("AvailablePoints")}
              >
                62,580 P
              </Text>
            </TouchableOpacity>
          </View>
          {/* 누적포인트 사용하기 */}
          <TouchableOpacity
            className="bg-[#E9690D] w-[90%] mt-8 py-5 rounded-xl"
            onPress={() => navigation.navigate("UsePoint")}
          >
            <Text className="text-center text-white text-[17px]">
              누적 포인트 <Text className="font-bold">사용하기</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* 포인트 받기 미션 */}
        <View className="mt-8 space-y-4">
          {missions.map((mission, index) => (
            <View
              key={index}
              className="flex-row mx-auto bg-[#121212] w-[90%] py-5 rounded-2xl items-center "
            >
              <View className=" px-7">
                <Text className="text-[#DFDFDF] text-[12px]">
                  {mission.textSmall}
                </Text>
                <Text className="text-white text-[22px] font-semibold mt-2">
                  {mission.textBig}
                </Text>
                <View className="flex-row items-center mt-1.5">
                  <Ionicons name="time-outline" size={16} color="#E9690D" />
                  <Text className="text-[#E9690D] text-[11px] ml-1.5 font-semibold">
                    {mission.time}
                  </Text>
                </View>
                <TouchableOpacity
                  className="items-center rounded-xl w-[80px] py-1 mt-5"
                  style={{ backgroundColor: mission.btnBg }}
                >
                  <Text
                    className="font-bold text-[14px]"
                    style={{ color: mission.btnTextColor }}
                  >
                    {mission.btnText}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 이미지 영역 */}
              <View className="">
                <Image
                  source={mission.image}
                  style={{
                    width: mission.imageWidth,
                    height: mission.imageHeight,
                    marginLeft: mission.textSmall.includes("매일 10,000보")
                      ? 30
                      : 0,
                    marginTop: mission.textSmall.includes("매일 10,000보")
                      ? 30
                      : 0,
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
