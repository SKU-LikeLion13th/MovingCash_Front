import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "App";

export const MembershipBanner = () => (
  <View className="flex-row items-center bg-[#2C2C2C] h-24 justify-between px-7 w-[95%] self-center mb-4 rounded-xl">
    <Text className="text-white font-bold text-[#EBEBEB] text-[18px]">
      프리미엄 운동 회원권,{"\n"}포인트로 겟!
    </Text>
    <Image
      source={require("assets/images/store/Membership/dumbbell.png")}
      className="w-[112px]"
      resizeMode="contain"
    />
  </View>
);

type NearbyProps = {
  navigation: NativeStackNavigationProp<StoreStackParamList>;
};

export default function Membership({ navigation }: NearbyProps) {
  const data = [
    {
      id: "1",
      image: require("assets/images/store/Membership/Membership_1.png"),
      name: "더메이커짐 헬스&PT 안양본점",
      distance: "913m",
      time: "러닝 6분",
      product: "1개월 이용권",
      points: "60,000",
    },
    {
      id: "2",
      image: require("assets/images/store/Membership/Membership_2.png"),
      name: "라이프피트니스 안양 헬스 PT 필라테스",
      distance: "2.7k",
      time: "러닝 17분",
      product: "1개월 이용권",
      points: "80,000",
    },
    {
      id: "3",
      image: require("assets/images/store/Membership/Membership_3.png"),
      name: "피트니스릴리 명학역점",
      distance: "1k",
      time: "러닝 7분",
      product: "3개월 이용권",
      points: "150,000",
    },
    {
      id: "4",
      image: require("assets/images/store/Membership/Membership_4.png"),
      name: "짐팩피트니스 안양명학점",
      distance: "1.4k",
      time: "러닝 14분",
      product: "3개월 이용권",
      points: "200,000",
    },
    {
      id: "5",
      image: require("assets/images/store/Membership/Membership_5.png"),
      name: "아루카PT&필라테스 평촌점",
      distance: "3.7k",
      time: "러닝 27분",
      product: "개인 레슨 24회",
      points: "500,000",
    },
    {
      id: "6",
      image: require("assets/images/store/Membership/Membership_6.png"),
      name: "원펀치쓰리칼로리 범계점",
      distance: "3.1k",
      time: "러닝 21분",
      product: "6개월 이용권",
      points: "120,000",
    },
  ];

  const cardWidth = (Dimensions.get("window").width * 0.95 - 16) / 2;

  return (
    <View className="px-2">
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        numColumns={2} // 한 줄에 2개
        columnWrapperStyle={{
          justifyContent: "space-between",
          marginBottom: 36,
        }}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }} className="">
            <TouchableOpacity
              onPress={() => navigation.navigate("ExchangeDetail", { item })}
            >
              <Image
                source={item.image}
                className="w-[170px] h-[100px] rounded-lg"
              />
            </TouchableOpacity>
            <View className="pl-1 space-y-1 mt-2">
              <Text className="text-[#7B7B7B] text-[10px]">{item.name}</Text>
              <View className="flex-row items-center space-x-2 mb-1">
                <Image
                  source={require("assets/images/store/location.png")}
                  className="w-[6px] h-[10px]"
                />
                <Text className="text-[#7B7B7B] text-[10px]">
                  {item.distance}
                </Text>
                <View className="w-[1px] h-2 bg-[#7B7B7B]" />
                <Text className="text-[#7B7B7B] text-[10px]">{item.time}</Text>
              </View>
              <Text className="text-white font-semibold">{item.product}</Text>
              <View className="flex-row items-center space-x-2">
                <Image
                  source={require("assets/images/store/point.png")}
                  className="w-[14px] h-[15px]"
                />
                <Text className="text-white font-semibold">{item.points}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
