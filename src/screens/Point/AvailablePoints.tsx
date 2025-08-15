import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import Header from "src/components/Header";

export default function AvailablePoints() {
  const missions = [
    {
      title: "Moving 스팟 둘러보고",
      point: "바로 30P 받기",
      btnText: "포인트 받기",
      btnType: "getPoint", // 참여하기: participate, 참여완료: done, 포인트받기: getPoint
      image: require("../../../assets/images/AvailablePoints/explore_spot.png"),
    },
    {
      title: "Moving 광고 시청하고",
      point: "바로 50P 받기",
      btnText: "참여하기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/watch_ad.png"),
    },
    {
      title: "Moving 친구 한 명 초대하고",
      point: "바로 100P 받기",
      btnText: "참여완료",
      btnType: "done",
      image: require("../../../assets/images/AvailablePoints/invite_friend.png"),
    },
    {
      title: "Moving에서 지역 상점 이용하고",
      point: "바로 200P 받기",
      btnText: "참여하기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/local_store.png"),
    },
    {
      title: "Moving에서 회원권 등록하고",
      point: "바로 250P 받기",
      btnText: "참여히기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/membership.png"),
    },
    {
      title: "Moving 챌린지 도전하고",
      point: "바로 300P 받기",
      btnText: "참여하기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/challenge.png"),
    },
  ];

  const getButtonStyle = (type: string) => {
    switch (type) {
      case "participate":
        return { backgroundColor: "#DBDBDB", color: "#707070" };
      case "done":
        return {
          backgroundColor: "#101010",
          color: "#999999",
          borderWidth: 1,
          borderColor: "#CCCCCC",
        };
      case "getPoint":
      default:
        return { backgroundColor: "#E9690D", color: "#ffffff" };
    }
  };

  return (
    <View className="h-full bg-[#101010]">
      <Header title="포인트" />

      {/* title */}
      <View className="flex-row items-center justify-between mt-5 px-5">
        <View>
          <Text className="text-white font-semibold text-[22px]">
            오늘 운동한 만큼{"\n"}포인트를 받아요
          </Text>
          <Text className="text-[#777777] font-semibold text-[15px] mt-3">
            꾸준히 운동하면 무빙에서{"\n"}포인트를 지급해 드려요.
          </Text>
        </View>
        <Image
          source={require("../../../assets/images/point.png")}
          className="w-[140px] h-[135px]"
          resizeMode="contain"
        />
      </View>

      {/* 더 많은 혜택 */}
      <Text className="text-white text-[15px] font-bold mt-10 px-5">
        더 많은 혜택이 기다리고 있어요!
      </Text>

      <View className="flex-1 items-center">
        <ScrollView className="space-y-5 mt-8 flex-1 pt-5 mb-28 bg-[#f9f9f9] rounded-2xl w-[95%]">
          {missions.map((mission, index) => {
            const btnStyle = getButtonStyle(mission.btnType);
            return (
              <View key={index} className="">
                <View className="pl-6 pr-7 pb-4 rounded-xl flex-row items-center justify-between bg-[#f9f9f9]">
                  <View>
                    <Text className="text-[#999999] text-[14px] mb-2">
                      {mission.title}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-[19px] text-[#101010] font-semibold">
                        {mission.point}
                      </Text>
                      <TouchableOpacity
                        className="rounded-full px-2 py-1 ml-3"
                        style={{
                          backgroundColor: btnStyle.backgroundColor,
                          borderWidth: btnStyle.borderWidth,
                          borderColor: btnStyle.borderColor,
                        }}
                      >
                        <Text
                          className="text-[10px] font-semibold"
                          style={{ color: btnStyle.color }}
                        >
                          {mission.btnText}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Image
                    source={mission.image}
                    className="w-[62px] h-[64px]"
                    resizeMode="contain"
                  />
                </View>

                {/* 마지막 미션이 아니면 구분선 */}
                {index !== missions.length - 1 && (
                  <View className="h-px bg-[#E0E0E0]" />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
