import React from "react";
import { View, Text } from "react-native";

type StatusType = "start" | "ongoing" | "stop" | "finish";

interface WalkingMotivationProps {
  status: StatusType;
  user?: string;
}

export default function WalkingMotivation({
  status,
  user,
}: WalkingMotivationProps) {
  const messages: Record<StatusType, string> = {
    start: "오늘도 같이 걸어볼까요?",
    ongoing: "어제보다 더 많이 걷고 있어요!",
    stop: "어제보다 더 많이 걷고 있어요!",
    finish: "오늘 워킹으로 70p가 쌓였어요!",
  };

  const message = messages[status];

  return (
    <View>
      <Text className="text-center text-base text-white font-bold mt-4">
        {message}
      </Text>
    </View>
  );
}
