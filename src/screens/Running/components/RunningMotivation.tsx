import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type StatusType = "start" | "ongoing" | "stop" | "finish";

interface RunningMotivationProps {
  status: StatusType;
}

export default function RunningMotivation({ status }: RunningMotivationProps) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
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
  }, []);

  const messages: Record<StatusType, string> = {
    start: "무빙과 함께 뛰어볼까요?",
    ongoing: `${user ? user + "님, " : ""}잘하고 계시네요!`,
    stop: `${user ? user + "님, " : ""}잘하고 계시네요!`,
    finish: "오늘 러닝 완벽해요!",
  };

  const message = messages[status];

  return (
    <View>
      <Text className="text-center text-xl text-white font-notoBold mt-4">
        {message}
      </Text>
    </View>
  );
}
