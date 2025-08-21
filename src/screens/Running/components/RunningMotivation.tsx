import React from "react";
import { View, Text } from "react-native";

type StatusType = "start" | "ongoing" | "stop" | "finish";

interface RunningMotivationProps {
  status: StatusType;
  user?: string;
}

export default function RunningMotivation({
  status,
  user,
}: RunningMotivationProps) {
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
