import React from "react";
import { View, Text, Image, ImageStyle, Pressable } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { MainStackParamList } from "App";
import { LinearGradient } from "expo-linear-gradient";
import Header from "src/components/Header";
import Point from "../../../assets/icons/Point.svg";
import ChallengeModal from "./ChallengeModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

type DetailRoute = RouteProp<MainStackParamList, "ChallengeDetail">;

const runningImg = require("../../../assets/images/Challenge/Running.png");
const walkingImg = require("../../../assets/images/Challenge/walking.png");

const RUNNING_STYLE: ImageStyle = { width: "30%" };
const WALKING_STYLE: ImageStyle = { width: "40%", marginRight: 30 };

const API_URL =
  Constants?.expoConfig?.extra?.apiUrl ?? "https://movingcash.sku-sku.com";

const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}T00:00:00`;
};

const parseGoalFromTitle = (title: string, activity: "WALKING" | "RUNNING") => {
  const t = (title || "").toLowerCase();
  if (activity === "WALKING") {
    const stepMatch = t.match(/(\d{1,3}(?:,\d{3})*|\d+)\s*보/);
    return stepMatch ? Number(stepMatch[1].replace(/,/g, "")) : 0;
  }
  const kmMatch = t.match(/(\d+(?:\.\d+)?)\s*km/);
  return kmMatch ? parseFloat(kmMatch[1]) : 0;
};

export default function ChallengeDetail() {
  const { params } = useRoute<DetailRoute>();
  const { id, title, reward, activity } = params;

  //이미지 설정
  const src = activity === "WALKING" ? walkingImg : runningImg;
  const imgStyle = activity === "WALKING" ? WALKING_STYLE : RUNNING_STYLE;

  //진행도 임시 설정
  const [current, setCurrent] = React.useState(0);
  const goal = React.useMemo(
    () => parseGoalFromTitle(title, activity as "WALKING" | "RUNNING"),
    [title, activity]
  );
  const pct = Math.max(0, Math.min(1, goal > 0 ? current / goal : 0));
  const isComplete = pct >= 1;

  const [showModal, setShowModal] = React.useState(false);

  const handleComplete = async () => {
    if (!isComplete) return;
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      await axios.post(
        `${API_URL}/join/add`,
        { challengeId: id },
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setShowModal(true);
    } catch (e: any) {
      console.warn("join add error:", e?.response?.status, e?.message);
    }
  };

  const handleClaim = () => {
    setShowModal(false);
  };

  React.useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) return;

        const today = todayStr();
        const body =
          activity === "WALKING"
            ? {
                status: "WALKING",
                startDate: today,
                endDate: today,
                todayDate: today,
              }
            : {
                status: "RUNNING",
                startDate: today,
                endDate: today,
                todayDate: today,
              };

        const res = await axios.post(
          "https://movingcash.sku-sku.com/mainPage",
          body,
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(res.data);

        if (activity === "WALKING") {
          setCurrent(Number(res.data?.steps) || 0);
        } else {
          setCurrent(Number(res.data?.totalDistance) || 0);
        }
      } catch (e: any) {
        console.warn("mainPage fetch error:", e?.response?.status, e?.message);
        setCurrent(0);
      }
    })();
  }, [activity, title]);

  const unit = activity === "WALKING" ? "steps" : "km";
  const formatVal = (v: number) =>
    activity === "WALKING"
      ? Math.max(0, Math.floor(v)).toLocaleString()
      : (Math.round(v * 100) / 100).toFixed(2);

  return (
    <View className="flex-1 bg-[#101010]">
      <Header title="Challenge" />
      <View className="flex-1 mt-2 bg-white rounded-t-3xl">
        <View className="items-center w-full mt-12">
          <Image source={src} style={imgStyle} resizeMode="contain" />
          <View className="w-[80%] mt-3 items-start">
            <Text className="text-xl font-bold">{title} 챌린지</Text>

            {/*진행도*/}
            <View className="flex-row items-end justify-between w-full mt-5 mb-2">
              <Text className="text-[16px] font-semibold">
                <Text className="text-[#E9690D]">{formatVal(current)}</Text>
                <Text className="text-xs font-medium text-gray-200">
                  {" "}
                  {unit}
                </Text>
              </Text>

              <Text className="text-[16px] font-semibold">
                <Text className="text-[#E9690D]">
                  {activity === "WALKING" ? formatVal(goal) : formatVal(goal)}
                </Text>
                <Text className="text-xs font-medium text-gray-200">
                  {" "}
                  {unit}
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
            <View className="h-[15%]"></View>

            {/*리워드*/}
            <Text className="text-xl font-bold">포인트 획득</Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                // marginTop: 15,
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
              className={`mt-16 w-full h-12 rounded-xl items-center justify-center ${
                isComplete ? "bg-[#E9690D]" : "bg-gray-300"
              }`}
              style={!isComplete ? { opacity: 0.7 } : undefined}
            >
              <Text className="font-semibold text-white">
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
