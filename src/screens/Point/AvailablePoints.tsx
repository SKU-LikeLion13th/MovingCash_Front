import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import Header from "src/components/Header";
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MainStackParamList } from "App";

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function AvailablePoints() {
  const [showPopup, setShowPopup] = useState(false);

  const [popupData, setPopupData] = useState<{
    title: string;
    point: string;
  } | null>(null);

  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [visitedSpot, setVisitedSpot] = useState(false);

  useEffect(() => {
    if (isFocused) {
      AsyncStorage.getItem("visitedMovingSpot").then((value) => {
        if (value === "true") setVisitedSpot(true);
      });
    }
  }, [isFocused]);

  const missions = [
    {
      key: "movingSpot",
      title: "Moving 스팟 둘러보고",
      point: "바로 30P 받기",
      btnText: visitedSpot ? "포인트 받기" : "참여하기",
      btnType: visitedSpot ? "getPoint" : "participate",
      image: require("../../../assets/images/AvailablePoints/explore_spot.png"),
    },
    {
      key: "watchAd",
      title: "Moving 광고 시청하고",
      point: "바로 50P 받기",
      btnText: "참여하기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/watch_ad.png"),
    },
    {
      key: "inviteFriend",
      title: "Moving 친구 한 명 초대하고",
      point: "바로 100P 받기",
      btnText: "참여하기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/invite_friend.png"),
    },
    {
      key: "localStore",
      title: "Moving에서 지역 상점 이용하고",
      point: "바로 200P 받기",
      btnText: "참여하기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/local_store.png"),
    },
    {
      key: "membership",
      title: "Moving에서 회원권 등록하고",
      point: "바로 250P 받기",
      btnText: "참여히기",
      btnType: "participate",
      image: require("../../../assets/images/AvailablePoints/membership.png"),
    },
    {
      key: "challenge",
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

  const handleMissionPress = async (mission: any) => {
    if (mission.key === "movingSpot") {
      if (mission.btnType === "participate") {
        // 참여하기 → 이동 & 방문 기록 저장
        await AsyncStorage.setItem("visitedMovingSpot", "true");
        navigation.navigate("MovingSpot");
      } else if (mission.btnType === "getPoint") {
        // 포인트받기 → 팝업 오픈
        setPopupData({ title: mission.title, point: mission.point });
        setShowPopup(true);
        // 여기서 서버에 포인트 지급 API 호출 가능
      }
    } else {
      console.log("엥:", mission.key);
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
        <ScrollView className="space-y-5 mt-8 flex-1 pt-5 mb-8 bg-[#f9f9f9] rounded-2xl w-[95%]">
          {missions.map((mission, index) => {
            const btnType =
              mission.key === "movingSpot"
                ? visitedSpot
                  ? "getPoint"
                  : "participate"
                : mission.btnType;

            const btnText =
              mission.key === "movingSpot"
                ? visitedSpot
                  ? "포인트 받기"
                  : "참여하기"
                : mission.btnText;

            const btnStyle = getButtonStyle(btnType);

            return (
              <View key={mission.key}>
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
                        onPress={() =>
                          handleMissionPress({ ...mission, btnType })
                        }
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
                          {btnText}
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
                {index !== missions.length - 1 && (
                  <View className="h-px bg-[#E0E0E0]" />
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      <Modal
        visible={showPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPopup(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View
            className=" p-6 rounded-lg w-[80%] "
            style={{ backgroundColor: "rgba(21, 21, 21, 0.97)" }}
          >
            <TouchableOpacity
              className="absolute top-4 right-4"
              onPress={() => setShowPopup(false)}
            >
              <Feather name="x" size={24} color="white" />
            </TouchableOpacity>

            <View className="items-center">
              <Image
                source={require("assets/images/money.png")}
                className="w-[181px] h-[181px]"
              />
              {popupData && (
                <>
                  <Text className="text-[#999999] text-[14px] mb-2">
                    {popupData.title}
                  </Text>
                  <Text className="text-white text-[22px] font-semibold mb-6">
                    {popupData.point.replace(/[^0-9P]/g, "")} 받았어요!
                  </Text>
                </>
              )}
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setShowPopup(false)}
              >
                <Text className="text-[#D4D4D4] text-[16px] mr-1">
                  확인하러 가기
                </Text>
                <AntDesign name="right" size={12} color={`#D4D4D4`} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
