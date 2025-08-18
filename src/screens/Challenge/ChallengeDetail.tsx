import React from "react";
import { View, Text, Image, ImageStyle, Pressable } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MainStackParamList } from "App";
import { LinearGradient } from "expo-linear-gradient";
import Header from "src/components/Header";
import Point from "../../../assets/icons/Point.svg";
import ChallengeModal from "./ChallengeModal";

type DetailRoute = RouteProp<MainStackParamList, "ChallengeDetail">;

const runningImg = require("../../../assets/images/Challenge/Running.png");
const walkingImg = require("../../../assets/images/Challenge/walking.png");

const RUNNING_STYLE: ImageStyle = { width: "30%" };
const WALKING_STYLE: ImageStyle = { width: "40%", marginRight: 30 };

export default function ChallengeDetail() {
  const { params } = useRoute<DetailRoute>();
  const { id, title, reward, activity } = params;

  //이미지 설정
  const src = activity === "WALKING" ? walkingImg : runningImg;
  const imgStyle = activity === "WALKING" ? WALKING_STYLE : RUNNING_STYLE;

  //진행도 임시 설정
  const current = 1000;
  const goal = 1000;
  const pct = Math.max(0, Math.min(1, current / goal));
  const isComplete = pct >= 1;

  const [showModal, setShowModal] = React.useState(false);

  const handleComplete = () => {
    if (!isComplete) return;
    // TODO: 완료 처리

    setShowModal(true);
  };

  const handleClaim = () => {
    // TODO: 포인트 수령 로직 (API 호출/상태 업데이트 등)
    setShowModal(false);
  };


  return (
    <View className="flex-1 bg-[#101010]">
      <Header title="Challenge" />
      <View className="mt-3 flex-1 bg-white rounded-t-3xl">
        <View className="w-full items-center">
          <Image source={src} style={imgStyle} resizeMode="contain" />
          <View className="w-[80%] items-start">
            <Text className="text-xl font-bold">{title} 챌린지</Text>

            {/*진행도*/}
            <View className="mt-3 w-full flex-row justify-between items-end mb-2">
              <Text className="text-[16px] font-semibold">
                <Text className="text-[#E9690D]">
                  {current.toLocaleString()}
                </Text>
                <Text className="text-gray-200 text-xs font-medium">
                  {" "}
                  steps
                </Text>
              </Text>

              <Text className="text-[16px] font-semibold">
                <Text className="text-[#E9690D]">{goal.toLocaleString()}</Text>
                <Text className="text-gray-200 text-xs font-medium">
                  {" "}
                  steps
                </Text>
              </Text>
            </View>
            <View className="w-full h-2 bg-[#E9E9E9] rounded-full overflow-hidden">
              <LinearGradient
                colors={["#242424", "#E9690D"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                className="rounded-full"
                style={{ width: `${pct * 100}%`, height: "100%" }}
              />
            </View>

            {/*걸으러가기?*/}
            <View className="h-[35%]">

            </View>

            {/*리워드*/}
            <Text className="text-xl font-bold">포인트 획득</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop:15
              }}
            >
              <Text
                className="text-2xl font-bold mr-1 text-[#E9690D]"
                style={{
                  transform: [{ translateY: -2 }],
                }}
              >
                {reward}
              </Text>
              <Point width={20} />
            </View>

            {/*챌린지 완료 버튼*/}
            <Pressable
              onPress={handleComplete}
              disabled={!isComplete}
              className={`mt-7 w-full h-12 rounded-xl items-center justify-center ${
                isComplete ? "bg-[#E9690D]" : "bg-gray-300"
              }`}
              style={!isComplete ? { opacity: 0.7 } : undefined}
            >
              <Text className="text-white font-semibold">
                {isComplete ? "챌린지 완료" : "목표 달성 후 완료"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      {/* 완료 모달 */}
      <ChallengeModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onClaim={handleClaim}
        title={`${title} 챌린지`}
      />
    </View>
  );
}
