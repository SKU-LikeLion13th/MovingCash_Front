import React from "react";
import { View, Text } from "react-native";

type ActivityType = "run" | "walk";
type StatusType = "start" | "ongoing" | "stop" | "finish";

interface MotivationTextProps {
  activity: ActivityType;
  status: StatusType;
  user?: string; // 선택사항
}

export default function MotivationText({
  activity,
  status,
  user,
}: MotivationTextProps) {
  // 각 활동과 상태에 따른 메세지 객체 정의
  const messages: Record<ActivityType, Record<StatusType, string>> = {
    run: {
      start: "무빙과 함께 뛰어볼까요?",
      ongoing: `${user ? user + "님, " : ""}잘하고 계시네요!`,
      stop: `${user ? user + "님, " : ""}잘하고 계시네요!`,
      finish: "오늘 러닝 완벽해요!",
    },
    walk: {
      start: "오늘도 같이 걸어볼까요?",
      ongoing: "어제보다 더 많이 걷고 있어요!",
      stop: "어제보다 더 많이 걷고 있어요!",
      finish: "오늘 워킹으로 72p가 쌓였어요!",
    },
  };

  const message = messages[activity][status];

  return (
    <View>
      <Text className="text-center text-base text-white font-bold mt-10">
        {message}
      </Text>
    </View>
  );
}
