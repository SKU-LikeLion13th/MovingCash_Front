import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../../../../App";
import { useWalking } from "../context/WalkingContext";

type StatusType = "start" | "ongoing" | "stop" | "finish";

interface WalkingMotivationProps {
  status: StatusType;
}

export default function WalkingMotivation({ status }: WalkingMotivationProps) {
  const [yesterdayStep, setYesterdayStep] = useState(0);
  const { points, steps } = useWalking();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
          // 토큰이 없으면 StartTab으로 이동
          navigation.navigate("StartTab");
          return;
        }

        const response = await fetch(
          "http://movingcash.sku-sku.com/sessions/getPointAndStep",
          {
            method: "GET",
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            // 401 에러 시 토큰 삭제 후 StartTab으로 이동
            console.warn("인증 토큰이 만료되었습니다. 다시 로그인해주세요.");
            await AsyncStorage.removeItem("accessToken");
            navigation.navigate("StartTab");
            return;
          }

          console.error(
            "API 호출 실패:",
            response.status,
            await response.text()
          );
          return;
        }

        const data = await response.json();
        setYesterdayStep(data.step);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchUserData();
  }, [navigation]);

  // 걸음수 비교 메시지 생성
  const getMotivationMessage = (): string => {
    if (steps > yesterdayStep) {
      return "어제보다 더 많이 걷고 있어요!";
    } else {
      return "오늘도 화이팅이에요!";
    }
  };

  const messages: Record<StatusType, string> = {
    start: "오늘도 같이 걸어볼까요?",
    ongoing: getMotivationMessage(),
    stop: getMotivationMessage(),
    finish: `오늘 워킹으로 ${points}p가 쌓였어요!`,
  };

  const message = messages[status];

  // finish 상태일 때 포인트 부분을 주황색으로 표시
  const renderMessage = () => {
    if (status === "finish") {
      const parts = message.split(`${points}p`);
      return (
        <Text className="text-center text-lg text-white font-notoBold mt-4">
          {parts[0]}
          <Text style={{ color: "#E9690D" }}>{points}p</Text>
          {parts[1]}
        </Text>
      );
    }

    return (
      <Text className="text-center text-lg text-white font-notoBold mt-4">
        {message}
      </Text>
    );
  };

  return <View>{renderMessage()}</View>;
}
