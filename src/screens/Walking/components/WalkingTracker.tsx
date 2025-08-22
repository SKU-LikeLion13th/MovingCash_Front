import { View, Text, TouchableOpacity, Animated } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  LinearGradient,
  Stop,
} from "react-native-svg";
import React, { useState, useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";
import WalkingMotivation from "./WalkingMotivation";

type StatusType = "start" | "ongoing" | "stop" | "finish";

const CALORIE_PER_STEP = 0.05;

export default function WalkingTracker({
  onTimeUpdate,
}: {
  onTimeUpdate?: (sec: number, hhmmss: string) => void;
}) {
  const [status, setStatus] = useState<StatusType>("start");
  const [steps, setSteps] = useState(0);

  /* 걸음수 감지 관련 Ref */
  const lastAccel = useRef({ x: 0, y: 0, z: 0 });
  const lastPeak = useRef({ x: 0, y: 0, z: 0 });
  const wasIncreasing = useRef({ x: false, y: false, z: false });
  const threshold = useRef(0.2);
  const minPeakDifference = useRef(0.3);

  const lastStepTime = useRef(0);
  const minStepInterval = useRef(350);
  const maxStepsPerSecond = useRef(4);
  const recentSteps = useRef<number[]>([]);

  const accelerationHistory = useRef<number[]>([]);
  const maxHistoryLength = 10;

  const [elapsedTime, setElapsedTime] = useState(0); // 초 단위 저장
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* 시간 포맷 변환 (HH:MM:SS) */
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  /* 타이머 시작 */
  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  /* 타이머 정지 */
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  /* 상태 변화에 따른 타이머 제어 */
  useEffect(() => {
    if (status === "ongoing") {
      startTimer();
    } else if (status === "stop" || status === "finish") {
      stopTimer();
    }
  }, [status]);

  useEffect(() => {
    onTimeUpdate?.(elapsedTime, formatTime(elapsedTime));
  }, [elapsedTime]);

  /* Accelerometer 사용*/
  useEffect(() => {
    let subscription: any;

    if (status === "ongoing") {
      Accelerometer.setUpdateInterval(50);
      subscription = Accelerometer.addListener((data) => {
        const { x, y, z } = data;
        const currentTime = Date.now();

        const totalAcceleration = Math.sqrt(x * x + y * y + z * z);
        accelerationHistory.current.push(totalAcceleration);
        if (accelerationHistory.current.length > maxHistoryLength) {
          accelerationHistory.current.shift();
        }

        if (!isShockDetected()) {
          detectStepWithTimeLimit(x, y, z, currentTime);
        }
      });
    }

    return () => {
      if (subscription) subscription.remove();
    };
  }, [status]);

  /* 충격 감지 */
  const isShockDetected = () => {
    if (accelerationHistory.current.length < 5) return false;
    const recent = accelerationHistory.current.slice(-5);
    const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const current = recent[recent.length - 1];
    return current > average * 2 && current > 12;
  };

  /* 걸음 감지 */
  const detectStepWithTimeLimit = (
    x: number,
    y: number,
    z: number,
    currentTime: number
  ) => {
    const currentAccel = { x, y, z };
    const prevAccel = lastAccel.current;

    if (prevAccel.x === 0 && prevAccel.y === 0 && prevAccel.z === 0) {
      lastAccel.current = { ...currentAccel };
      lastPeak.current = { ...currentAccel };
      return;
    }

    const timeSinceLastStep = currentTime - lastStepTime.current;
    if (timeSinceLastStep < minStepInterval.current) {
      lastAccel.current = { ...currentAccel };
      return;
    }

    recentSteps.current = recentSteps.current.filter(
      (timestamp) => currentTime - timestamp < 1000
    );
    if (recentSteps.current.length >= maxStepsPerSecond.current) {
      lastAccel.current = { ...currentAccel };
      return;
    }

    let stepDetected = false;

    ["x", "y", "z"].forEach((axis) => {
      const current = currentAccel[axis as "x" | "y" | "z"];
      const prev = prevAccel[axis as "x" | "y" | "z"];
      const lastPeakValue = lastPeak.current[axis as "x" | "y" | "z"];

      const difference = current - prev;
      const isIncreasing = difference > threshold.current;
      const isDecreasing = difference < -threshold.current;
      const wasGoingUp = wasIncreasing.current[axis as "x" | "y" | "z"];

      if (wasGoingUp && isDecreasing) {
        const peakDifference = Math.abs(prev - lastPeakValue);
        if (peakDifference > minPeakDifference.current) {
          stepDetected = true;
          lastPeak.current[axis as "x" | "y" | "z"] = prev;
        }
      } else if (!wasGoingUp && isIncreasing) {
        const valleyDifference = Math.abs(prev - lastPeakValue);
        if (valleyDifference > minPeakDifference.current) {
          stepDetected = true;
          lastPeak.current[axis as "x" | "y" | "z"] = prev;
        }
      }

      if (isIncreasing || isDecreasing) {
        wasIncreasing.current[axis as "x" | "y" | "z"] = isIncreasing;
      }
    });

    if (stepDetected) {
      setSteps((prev) => prev + 1);
      lastStepTime.current = currentTime;
      recentSteps.current.push(currentTime);
    }

    lastAccel.current = { ...currentAccel };
  };

  /* 걸음수 리셋 */
  const resetSteps = () => {
    setSteps(0);
    lastAccel.current = { x: 0, y: 0, z: 0 };
    lastPeak.current = { x: 0, y: 0, z: 0 };
    wasIncreasing.current = { x: false, y: false, z: false };
    lastStepTime.current = 0;
    recentSteps.current = [];
    accelerationHistory.current = [];
  };

  /* 상태 전환 핸들러 */
  const handleStart = () => {
    // resetSteps();
    setStatus("ongoing");
  };
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
