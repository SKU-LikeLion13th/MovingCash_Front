import { View, Text, Pressable } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import React, { useState } from "react";

type StatusType = "start" | "ongoing" | "stop" | "finish";

export default function RunningTracker() {
  const [status, setStatus] = useState<StatusType>("start");

  const size = 180;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 상태 전환 로직
  const handleStart = () => setStatus("ongoing");
  const handlePause = () => setStatus("stop");
  const handleResume = () => setStatus("ongoing");
  const handleFinish = () => setStatus("finish");

  // 상태별 원 UI
  const renderStart = () => (
    <>
      <View className="mt-10 items-center justify-center">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E9690D"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.75}, ${circumference * 0.25}`}
          />
        </Svg>
        <Text className="absolute text-[43px] text-white font-bold">Start</Text>
      </View>
    </>
  );

  const renderOngoing = () => (
    <>
      <View className="mt-10 items-center justify-center">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#E9690D" />
              <Stop offset="100%" stopColor="#FFFFFF" />
            </LinearGradient>
          </Defs>

          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.75}, ${circumference * 0.25}`}
          />
        </Svg>
        <Text className="absolute text-[43px] text-white font-bold">
          1.2 <Text className="text-4xl">km</Text>
        </Text>
      </View>
    </>
  );

  const renderStop = () => (
    <>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFD700"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * 0.4}, ${circumference * 0.6}`}
        />
      </Svg>
      <Text className="absolute text-[43px] text-white font-bold">Paused</Text>
      <Text className="absolute top-[65%] text-sm text-yellow-300">
        이어 달리기 가능
      </Text>
    </>
  );

  const renderFinish = () => (
    <>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E9690D"
          strokeWidth={strokeWidth}
          fill="none"
        />
      </Svg>
      <Text className="absolute text-[36px] text-white font-bold">
        Complete!
      </Text>
      <Text className="absolute top-[65%] text-green-300">
        오늘 기록이 저장되었습니다.
      </Text>
    </>
  );

  const renderByStatus = () => {
    switch (status) {
      case "start":
        return renderStart();
      case "ongoing":
        return renderOngoing();
      case "stop":
        return renderStop();
      case "finish":
        return renderFinish();
      default:
        return null;
    }
  };

  /** ----- 버튼 UI ----- */
  const renderButtons = () => {
    switch (status) {
      case "start":
        return (
          <Pressable
            onPress={handleStart}
            className="w-[40%] h-10 flex justify-center items-center bg-[#E9690D] rounded-lg mt-3"
          >
            <Text className="text-white font-bold">시작하기</Text>
          </Pressable>
        );
      case "ongoing":
        return (
          <View className="flex-row justify-around w-full mt-3">
            <Pressable
              onPress={handlePause}
              className="w-[40%] h-10 flex justify-center items-center bg-[#4D4D4D] rounded-lg"
            >
              <Text className="text-white font-bold">종료하기</Text>
            </Pressable>
            <Pressable
              onPress={handleFinish}
              className="w-[40%] h-10 flex justify-center items-center bg-[#4D4D4D] rounded-lg"
            >
              <Text className="text-white font-bold">일시정지</Text>
            </Pressable>
          </View>
        );
      case "stop":
        return (
          <View className="flex-row justify-around w-full">
            <Pressable
              onPress={handleResume}
              className="w-[40%] h-10 flex justify-center items-center bg-green-500 rounded-lg"
            >
              <Text className="text-white font-bold">재개</Text>
            </Pressable>
            <Pressable
              onPress={handleFinish}
              className="w-[40%] h-10 flex justify-center items-center bg-red-500 rounded-lg"
            >
              <Text className="text-white font-bold">종료</Text>
            </Pressable>
          </View>
        );
      case "finish":
        return null; // 버튼 없음
    }
  };

  return (
    <View>
      <View className="mt-10 items-center justify-center">
        {renderByStatus()}
      </View>
      <View className="flex-row justify-around mt-10 px-5">
        {renderButtons()}
      </View>
    </View>
  );
}

{
  /* <View className="flex-row justify-around mt-10 px-5">
  <Pressable className="w-[40%] h-10 flex justify-center items-center bg-[#E9690D] rounded-lg">
    <Text className="text-white text-sm font-bold">시작하기</Text>
  </Pressable>
</View>; */
}
