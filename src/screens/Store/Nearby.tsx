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

export const NearbyBanner = () => (
  <View className="flex-row items-center bg-[#2C2C2C] h-24 justify-between px-7 w-[95%] self-center mb-4 rounded-xl">
    <Text className="text-white font-bold text-[#EBEBEB] text-[18px]">
      내 주변 상점에서{"\n"}포인트로 득템!
    </Text>
    <Image
      source={require("assets/images/store/Nearby/cart.png")}
      className="w-[100px] h-[100px]"
    />
  </View>
);

type NearbyProps = {
  navigation: NativeStackNavigationProp<StoreStackParamList>;
};

export default function Nearby({ navigation }: NearbyProps) {
  const data = [
    {
      id: "1",
      image: require("assets/images/store/Nearby/Nearby_1.png"),
      name: "나들가게 한양슈퍼",
      distance: "3.1k",
      time: "러닝 21분",
      product: "상품권 20,000원권",
      points: "20,000",
    },
    {
      id: "2",
      image: require("assets/images/store/Nearby/Nearby_2.png"),
      name: "한빛미트정육",
      distance: "3k",
      time: "러닝 20분",
      product: "상품권 30,000원권",
      points: "30,000",
    },
    {
      id: "3",
      image: require("assets/images/store/Nearby/Nearby_3.png"),
      name: "빵집아저씨",
      distance: "2.3k",
      time: "러닝 13분",
      product: "교환권 10,000원권",
      points: "10,000",
    },
    {
      id: "4",
      image: require("assets/images/store/Nearby/Nearby_4.png"),
      name: "안양남부시장",
      distance: "2.2k",
      time: "러닝 12분",
      product: "지역 화폐 50,000원권",
      points: "50,000",
    },
    {
      id: "5",
      image: require("assets/images/store/Nearby/Nearby_5.png"),
      name: "시에나커피로스터스",
      distance: "2.7k",
      time: "러닝 17분",
      product: "교환권 10,000원권",
      points: "10,000",
    },
    {
      id: "6",
      image: require("assets/images/store/Nearby/Nearby_6.png"),
      name: "썰스티",
      distance: "2.9k",
      time: "러닝 19분",
      product: "교환권 20,000원권",
      points: "20,000",
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
