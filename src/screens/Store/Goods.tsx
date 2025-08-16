import React from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StoreStackParamList } from "App";

export const GoodsBanner = () => (
  <View className="w-[95%] h-24 self-center mb-4 rounded-xl relative justify-center">
    <Image
      source={require("../../../assets/images/store/Goods/GoodsBanner1.png")}
      className="absolute w-full h-full"
      style={{ resizeMode: "stretch" }}
    />
    <Text className="text-white font-bold text-[#EBEBEB] text-[18px] px-7">
      챌린지 완주하고{"\n"}전용 굿즈 받아가세요!
    </Text>
  </View>
);

// type NearbyProps = {
//   navigation: NativeStackNavigationProp<StoreStackParamList>;
// };

// { navigation }: NearbyProps
export default function Goods() {
  const goodsData = [
    {
      id: 1,
      name: "기념 티셔츠",
      sub: "완주자 전용",
      point: 0,
      image: require("assets/images/store/Goods/Goods_1.png"),
    },
    {
      id: 2,
      name: "기념 모자",
      sub: "완주자 전용",
      point: 0,
      image: require("assets/images/store/Goods/Goods_2.png"),
    },
  ];
  return (
    <ScrollView className="px-5 ">
      <View className="flex-row flex-wrap ">
        {goodsData.map((item) => (
          <View key={item.id} className="w-full mb-8">
            <TouchableOpacity
            //   onPress={() => navigation.navigate("ExchangeDetail", { item })}
            >
              <Image
                source={item.image}
                className="w-full h-[185px] self-center rounded-lg"
              />
            </TouchableOpacity>
            <View className="flex-row items-end space-x-2 mt-2">
              <Text className="text-white font-semibold text-[18px]">
                {item.name}
              </Text>
              <Text className="text-[#999999] text-[12px] pb-0.5">
                {item.sub}
              </Text>
            </View>
            <View className="flex-row items-center space-x-2 mt-1">
              <Image
                source={require("assets/images/store/point.png")}
                className="w-[15px] h-[16px]"
              />
              <Text className="text-white">{item.point}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
