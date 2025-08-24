import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useRunning } from "../context/RunningContext";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../../../../App";

type StatusType = "start" | "ongoing" | "stop" | "finish";

interface RunningMotivationProps {
  status: StatusType;
}

export default function RunningMotivation({ status }: RunningMotivationProps) {
  const { distance } = useRunning();
  const [user, setUser] = useState<string | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
          // 토큰이 없으면 StartTab의 Login으로 이동
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
            // 401 에러 시 토큰 삭제 후 StartTab의 Login으로 이동
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
        setUser(data.name);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchUserData();
  }, [navigation]);

  // 거리 조건에 따라 메시지 선택
  const messages: Record<StatusType, string> = {
    start: "무빙과 함께 뛰어볼까요?",
    ongoing:
      distance < 1
        ? "오늘도 화이팅이에요!"
        : `${user ? user + "님, " : ""}잘하고 계시네요!`,
    stop:
      distance < 1
        ? "오늘도 화이팅이에요!"
        : `${user ? user + "님, " : ""}잘하고 계시네요!`,
    finish: "오늘 러닝 완벽해요!",
  };

  const message = messages[status];

  return (
    <View>
      <Text className="text-center text-lg text-white font-notoBold mt-4">
        {message}
      </Text>
    </View>
  );
}
