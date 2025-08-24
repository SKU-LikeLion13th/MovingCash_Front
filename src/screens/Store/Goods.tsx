import React from "react";
import { Text, View, Image, ScrollView, TouchableOpacity } from "react-native";

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

export default function Goods() {
  const goodsData = [
    {
      id: 1,
      name: "기념 티셔츠",
      sub: "완주자 전용",
      point: 0,
      image: require("assets/images/store/Goods/Goods_1.png"),
      locked: false, // 🔒 잠금 처리
    },
    {
      id: 2,
      name: "기념 모자",
      sub: "완주자 전용",
      point: 0,
      image: require("assets/images/store/Goods/Goods_2.png"),
      locked: true,
    },
  ];

  return (
    <ScrollView className="px-5 ">
      <View className="flex-row flex-wrap ">
        {goodsData.map((item) => (
          <View key={item.id} className="w-full mb-8 relative">
            <TouchableOpacity
              disabled={item.locked} // 잠겨있으면 클릭 불가
              // onPress={() => navigation.navigate("ExchangeDetail", { item })}
            >
              <Image
                source={item.image}
                className="w-full h-[185px] self-center rounded-lg"
                style={{
                  opacity: item.locked ? 0.4 : 1, // 🔒 잠금 시 흐리게
                }}
              />
              {item.locked && (
                <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
                  <Image
                    source={require("assets/images/store/lock.png")}
                    className="w-10 h-10"
                  />
                </View>
              )}
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
