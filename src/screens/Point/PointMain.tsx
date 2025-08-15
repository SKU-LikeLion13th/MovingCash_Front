import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import Header from "src/components/Header";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "App";

export default function PointMain() {
  // 2. useNavigation에 타입 적용
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const missions = [
    {
      textSmall: "매일 10,000보 걷고",
      textBig: "100원 받기",
      time: "09:22:24",
      image: require("../../../assets/images/sneakers.png"),
      imageWidth: 160, // px 단위
      imageHeight: 80,
      btnText: "포인트 받기",
      btnBg: "#E9690D",
      textPadding: 28,
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
      textPadding: 20,
      btnTextColor: "#707070",
    },
  ];

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
              32,100 P
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
        <View className="mt-12 space-y-6">
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
