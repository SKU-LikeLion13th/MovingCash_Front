import { View, Text, TouchableOpacity } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  LinearGradient,
  Stop,
} from "react-native-svg";
import React from "react";
import WalkingMotivation from "./WalkingMotivation";
import { useWalking } from "../context/WalkingContext";

export default function WalkingTracker() {
  const { status, steps, setStatus } = useWalking();

  /* 상태 전환 핸들러 - WalkingContext에서 API 처리 */
  const handleStart = () => setStatus("ongoing");
  const handlePause = () => setStatus("stop");
  const handleResume = () => setStatus("ongoing");
  const handleFinish = () => setStatus("finish");

  /* 원형 UI 설정 */
  const size = 180;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  /* UI 렌더링 */
  const renderStart = () => (
    <>
      <WalkingMotivation status="start" />
      <View className="mt-12 items-center justify-center">
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
        <Text className="absolute text-5xl text-white font-poppinsSemiBold">
          Start
        </Text>
      </View>
    </>
  );

  const renderOngoing = () => {
    const createArcPath = (
      startAngle: number,
      endAngle: number,
      radius: number,
      centerX: number,
      centerY: number
    ): string => {
      const start = polarToCartesian(centerX, centerY, radius, endAngle);
      const end = polarToCartesian(centerX, centerY, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      return [
        "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
      ].join(" ");
    };

    const polarToCartesian = (
      centerX: number,
      centerY: number,
      radius: number,
      angleInDegrees: number
    ): { x: number; y: number } => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const centerX: number = size / 2;
    const centerY: number = size / 2;
    const totalDegrees: number = -270;
    const segments: number = 60;
    const degreesPerSegment: number = totalDegrees / segments;

    return (
      <>
        <WalkingMotivation status="ongoing" />
        <View className="mt-12 items-center justify-center">
          <Svg width={size} height={size}>
            <Defs>
              {Array.from({ length: segments }, (_, i: number) => {
                const whiteBlend: number = Math.min(1, i / (segments * 0.7));
                const finalColor: string = `rgb(${
                  233 + (255 - 233) * whiteBlend
                }, ${105 + (255 - 105) * whiteBlend}, ${
                  13 + (255 - 13) * whiteBlend
                })`;
                return (
                  <LinearGradient
                    key={i}
                    id={`grad${i}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%">
                    <Stop offset="0%" stopColor={finalColor} />
                    <Stop offset="100%" stopColor={finalColor} />
                  </LinearGradient>
                );
              })}
            </Defs>

            {Array.from({ length: segments }, (_, i: number) => {
              const startAngle: number = i * degreesPerSegment;
              const endAngle: number = (i + 1) * degreesPerSegment;
              const whiteBlend: number = i / (segments - 1);
              const r: number = Math.round(233 + (255 - 233) * whiteBlend);
              const g: number = Math.round(105 + (255 - 105) * whiteBlend);
              const b: number = Math.round(13 + (255 - 13) * whiteBlend);
              const color: string = `rgb(${r}, ${g}, ${b})`;

              return (
                <Path
                  key={i}
                  d={createArcPath(
                    startAngle,
                    endAngle,
                    radius,
                    centerX,
                    centerY
                  )}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </Svg>
          <Text className="absolute top-16 text-5xl text-white font-poppinsSemiBold">
            {steps.toLocaleString()}
          </Text>
          <Text className="absolute bottom-11 text-base text-white font-poppinsRegular">
            steps
          </Text>
        </View>
      </>
    );
  };

  const renderStop = () => (
    <>
      <WalkingMotivation status="stop" />
      <View className="mt-12 items-center justify-center">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#939393"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.75}, ${circumference * 0.25}`}
          />
        </Svg>
        <Text className="absolute top-[65px] text-5xl text-white font-poppinsSemiBold">
          Stop
        </Text>
        <Text className="absolute bottom-11 text-base text-white font-poppinsRegular">
          {steps.toLocaleString()} steps
        </Text>
      </View>
    </>
  );

  const renderFinish = () => (
    <>
      <WalkingMotivation status="finish" />
      <View className="mt-12 items-center justify-center">
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#FFFFFF"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${circumference * 0.5}, ${circumference * 0.25}`}
          />
        </Svg>
        <Text className="absolute top-[65px] text-5xl text-white font-poppinsSemiBold">
          Finish!
        </Text>
        <Text className="absolute bottom-11 text-base text-[#E9690D] font-poppinsRegular">
          {steps.toLocaleString()} steps
        </Text>
      </View>
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
    }
  };

  const renderButtons = () => {
    switch (status) {
      case "start":
        return (
          <TouchableOpacity
            onPress={handleStart}
            className="w-[40%] h-10 flex justify-center items-center bg-[#E9690D] rounded-lg mt-3">
            <Text className="text-white text-base font-notoBold">시작하기</Text>
          </TouchableOpacity>
        );
      case "ongoing":
        return (
          <View className="flex-row justify-around w-full mt-3">
            <TouchableOpacity
              onPress={handleFinish}
              className="w-[40%] h-10 flex justify-center items-center bg-[#4D4D4D] rounded-lg">
              <Text className="text-white text-base font-notoBold">
                종료하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handlePause}
              className="w-[40%] h-10 flex justify-center items-center bg-[#4D4D4D] rounded-lg">
              <Text className="text-white text-base font-notoBold">
                일시정지
              </Text>
            </TouchableOpacity>
          </View>
        );
      case "stop":
        return (
          <View className="flex-row justify-around w-full mt-3">
            <TouchableOpacity
              onPress={handleFinish}
              className="w-[40%] h-10 flex justify-center items-center bg-[#4D4D4D] rounded-lg">
              <Text className="text-white text-base font-notoBold">
                종료하기
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleResume}
              className="w-[40%] h-10 flex justify-center items-center bg-[#E9690D] rounded-lg">
              <Text className="text-white text-base font-notoBold">
                이어서 걷기
              </Text>
            </TouchableOpacity>
          </View>
        );
      case "finish":
        return null;
    }
  };

  return (
    <View>
      <View className="items-center justify-center">{renderByStatus()}</View>
      <View
        className={`flex-row justify-around ${
          status == "finish" ? "mt-1.5" : "mt-8"
        } px-8`}>
        {renderButtons()}
      </View>
    </View>
  );
}
