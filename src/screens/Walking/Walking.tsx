import Header from "src/components/Header";
import WalkingTracker from "./components/WalkingTracker";
import WalkingPoints from "./components/WalkingPoints";
import WalkingDetail from "./components/WalkingDetail";
import { View, ScrollView } from "react-native";

export default function Walking() {
  return (
    <View className="flex-1 bg-[#101010]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120, // 바텀시트 최소 높이만큼 여백 확보
        }}
      >
        <View className="px-3">
          <Header title="Walking" />
          <WalkingTracker />
          <WalkingPoints />
        </View>
      </ScrollView>

      {/* 하단 고정 Bottom Sheet */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          // 하단에 여백 없이 완전히 고정
          height: "100%", // 전체 높이 사용 가능하도록
        }}
        pointerEvents="box-none" // 터치 이벤트가 바텀시트로만 전달되도록
      >
        <WalkingDetail />
      </View>
    </View>
  );
}

// import React, { useState, useEffect, useRef } from "react";
// import { Text, View } from "react-native";
// import { Accelerometer } from "expo-sensors";

// const CALORIE_PER_STEP = 0.05;

// export default function Walking() {
//   const [steps, setSteps] = useState(0);
//   const [isDebugMode, setIsDebugMode] = useState(false);
//   const [debugInfo, setDebugInfo] = useState("");

//   // 각 축별로 이전 값과 피크 추적
//   const lastAccel = useRef({ x: 0, y: 0, z: 0 });
//   const lastPeak = useRef({ x: 0, y: 0, z: 0 });
//   const wasIncreasing = useRef({ x: false, y: false, z: false });
//   const threshold = useRef(0.2);
//   const minPeakDifference = useRef(0.3);

//   // 충격 방지를 위한 시간 제한
//   const lastStepTime = useRef(0);
//   const minStepInterval = useRef(300); // 최소 걸음 간격 (300ms)
//   const maxStepsPerSecond = useRef(4); // 초당 최대 걸음 수
//   const recentSteps = useRef([]); // 최근 걸음들의 타임스탬프

//   // 충격 감지를 위한 변수들
//   const accelerationHistory = useRef([]);
//   const maxHistoryLength = 10;

//   useEffect(() => {
//     let subscription;

//     Accelerometer.isAvailableAsync().then((result) => {
//       if (result) {
//         Accelerometer.setUpdateInterval(50);

//         subscription = Accelerometer.addListener((data) => {
//           const { x, y, z } = data;
//           const currentTime = Date.now();

//           // 전체 가속도 크기 계산 (충격 감지용)
//           const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

//           // 가속도 히스토리 업데이트
//           accelerationHistory.current.push(totalAcceleration);
//           if (accelerationHistory.current.length > maxHistoryLength) {
//             accelerationHistory.current.shift();
//           }

//           // 충격 감지
//           if (isShockDetected()) {
//             if (isDebugMode) {
//               setDebugInfo("⚠️ 충격 감지 - 걸음 카운트 무시");
//             }
//             return; // 충격이면 걸음 감지 하지 않음
//           }

//           detectStepWithTimeLimit(x, y, z, currentTime);

//           if (isDebugMode) {
//             const timeSinceLastStep = currentTime - lastStepTime.current;
//             setDebugInfo(
//               `X: ${x.toFixed(2)} ${getMovementSymbol("x", x)} | ` +
//                 `Y: ${y.toFixed(2)} ${getMovementSymbol("y", y)} | ` +
//                 `Z: ${z.toFixed(2)} ${getMovementSymbol("z", z)} | ` +
//                 `마지막걸음: ${timeSinceLastStep}ms`
//             );
//           }
//         });
//       }
//     });

//     return () => {
//       if (subscription) {
//         subscription.remove();
//       }
//     };
//   }, [isDebugMode]);

//   // 충격 감지 함수
//   const isShockDetected = () => {
//     if (accelerationHistory.current.length < 5) return false;

//     const recent = accelerationHistory.current.slice(-5);
//     const average = recent.reduce((sum, val) => sum + val, 0) / recent.length;
//     const current = recent[recent.length - 1];

//     // 갑작스러운 큰 변화 감지 (평균의 2배 이상)
//     const isShock = current > average * 2 && current > 12; // 12는 중력가속도 + 충격

//     return isShock;
//   };

//   const getMovementSymbol = (axis, currentValue) => {
//     const prev = lastAccel.current[axis];
//     const diff = currentValue - prev;

//     if (Math.abs(diff) < threshold.current) return "-";
//     return diff > 0 ? "↗" : "↘";
//   };

//   const detectStepWithTimeLimit = (x, y, z, currentTime) => {
//     const currentAccel = { x, y, z };
//     const prevAccel = lastAccel.current;

//     // 첫 번째 측정이면 초기화
//     if (prevAccel.x === 0 && prevAccel.y === 0 && prevAccel.z === 0) {
//       lastAccel.current = { ...currentAccel };
//       lastPeak.current = { ...currentAccel };
//       return;
//     }

//     // 시간 제한 체크
//     const timeSinceLastStep = currentTime - lastStepTime.current;
//     if (timeSinceLastStep < minStepInterval.current) {
//       lastAccel.current = { ...currentAccel };
//       return; // 너무 짧은 간격이면 무시
//     }

//     // 최근 1초간 걸음 수 체크
//     recentSteps.current = recentSteps.current.filter(
//       (timestamp) => currentTime - timestamp < 1000
//     );

//     if (recentSteps.current.length >= maxStepsPerSecond.current) {
//       lastAccel.current = { ...currentAccel };
//       return; // 초당 최대 걸음 수 초과시 무시
//     }

//     let stepDetected = false;

//     // 각 축별로 피크와 골 감지
//     ["x", "y", "z"].forEach((axis) => {
//       const current = currentAccel[axis];
//       const prev = prevAccel[axis];
//       const lastPeakValue = lastPeak.current[axis];

//       const difference = current - prev;
//       const isIncreasing = difference > threshold.current;
//       const isDecreasing = difference < -threshold.current;
//       const wasGoingUp = wasIncreasing.current[axis];

//       // 방향 전환 감지 (피크 또는 골 감지)
//       if (wasGoingUp && isDecreasing) {
//         // 피크 감지
//         const peakDifference = Math.abs(prev - lastPeakValue);
//         if (peakDifference > minPeakDifference.current) {
//           stepDetected = true;
//           lastPeak.current[axis] = prev;
//         }
//       } else if (!wasGoingUp && isIncreasing) {
//         // 골 감지
//         const valleyDifference = Math.abs(prev - lastPeakValue);
//         if (valleyDifference > minPeakDifference.current) {
//           stepDetected = true;
//           lastPeak.current[axis] = prev;
//         }
//       }

//       // 현재 방향 저장
//       if (isIncreasing || isDecreasing) {
//         wasIncreasing.current[axis] = isIncreasing;
//       }
//     });

//     // 걸음이 감지되고 시간 조건을 만족하면 카운트
//     if (stepDetected) {
//       setSteps((prev) => prev + 1);
//       lastStepTime.current = currentTime;
//       recentSteps.current.push(currentTime);
//     }

//     lastAccel.current = { ...currentAccel };
//   };

//   const resetSteps = () => {
//     setSteps(0);
//     lastAccel.current = { x: 0, y: 0, z: 0 };
//     lastPeak.current = { x: 0, y: 0, z: 0 };
//     wasIncreasing.current = { x: false, y: false, z: false };
//     lastStepTime.current = 0;
//     recentSteps.current = [];
//     accelerationHistory.current = [];
//   };

//   const toggleDebugMode = () => {
//     setIsDebugMode(!isDebugMode);
//   };

//   // 민감도 조정
//   const increaseThreshold = () => {
//     threshold.current = Math.min(0.5, threshold.current + 0.05);
//     minPeakDifference.current = Math.min(1.0, minPeakDifference.current + 0.1);
//   };

//   const decreaseThreshold = () => {
//     threshold.current = Math.max(0.05, threshold.current - 0.05);
//     minPeakDifference.current = Math.max(0.1, minPeakDifference.current - 0.1);
//   };

//   // 시간 제한 조정
//   const increaseTimeLimit = () => {
//     minStepInterval.current = Math.min(500, minStepInterval.current + 50);
//     maxStepsPerSecond.current = Math.max(2, maxStepsPerSecond.current - 1);
//   };

//   const decreaseTimeLimit = () => {
//     minStepInterval.current = Math.max(100, minStepInterval.current - 50);
//     maxStepsPerSecond.current = Math.min(6, maxStepsPerSecond.current + 1);
//   };

//   const estimatedCaloriesBurned = (steps * CALORIE_PER_STEP).toFixed(2);

//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 20,
//       }}>
//       <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
//         Step Tracker
//       </Text>

//       <View style={{ alignItems: "center", marginBottom: 30 }}>
//         <Text style={{ fontSize: 48, fontWeight: "bold", color: "#007AFF" }}>
//           {steps}
//         </Text>
//         <Text style={{ fontSize: 18, color: "gray" }}>걸음</Text>
//       </View>

//       <View style={{ alignItems: "center", marginBottom: 30 }}>
//         <Text style={{ fontSize: 24, fontWeight: "bold", color: "#FF6B35" }}>
//           {estimatedCaloriesBurned}
//         </Text>
//         <Text style={{ fontSize: 16, color: "gray" }}>칼로리</Text>
//       </View>

//       {isDebugMode && (
//         <View
//           style={{
//             backgroundColor: "#f0f0f0",
//             padding: 15,
//             marginBottom: 20,
//             borderRadius: 8,
//             width: "100%",
//           }}>
//           <Text
//             style={{
//               fontSize: 11,
//               fontFamily: "monospace",
//               textAlign: "center",
//               lineHeight: 16,
//             }}>
//             {debugInfo}
//           </Text>
//           <View style={{ marginTop: 10, alignItems: "center" }}>
//             <Text style={{ fontSize: 10, color: "gray" }}>
//               걸음간격: {minStepInterval.current}ms | 초당최대:{" "}
//               {maxStepsPerSecond.current}걸음 | 민감도:{" "}
//               {threshold.current.toFixed(2)}
//             </Text>
//           </View>
//         </View>
//       )}

//       <View style={{ flexDirection: "row", gap: 10, marginBottom: 15 }}>
//         <View
//           style={{
//             backgroundColor: "#007AFF",
//             paddingHorizontal: 20,
//             paddingVertical: 12,
//             borderRadius: 8,
//           }}>
//           <Text
//             style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
//             onPress={resetSteps}>
//             초기화
//           </Text>
//         </View>

//         <View
//           style={{
//             backgroundColor: isDebugMode ? "#FF6B35" : "#888",
//             paddingHorizontal: 20,
//             paddingVertical: 12,
//             borderRadius: 8,
//           }}>
//           <Text
//             style={{ color: "white", fontSize: 16, fontWeight: "bold" }}
//             onPress={toggleDebugMode}>
//             {isDebugMode ? "디버그 OFF" : "디버그 ON"}
//           </Text>
//         </View>
//       </View>

//       {isDebugMode && (
//         <View>
//           <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
//             <View
//               style={{
//                 backgroundColor: "#28a745",
//                 paddingHorizontal: 15,
//                 paddingVertical: 10,
//                 borderRadius: 8,
//               }}>
//               <Text
//                 style={{ color: "white", fontSize: 14, fontWeight: "bold" }}
//                 onPress={decreaseThreshold}>
//                 민감도 ↑
//               </Text>
//             </View>

//             <View
//               style={{
//                 backgroundColor: "#dc3545",
//                 paddingHorizontal: 15,
//                 paddingVertical: 10,
//                 borderRadius: 8,
//               }}>
//               <Text
//                 style={{ color: "white", fontSize: 14, fontWeight: "bold" }}
//                 onPress={increaseThreshold}>
//                 민감도 ↓
//               </Text>
//             </View>
//           </View>

//           <View style={{ flexDirection: "row", gap: 10 }}>
//             <View
//               style={{
//                 backgroundColor: "#6f42c1",
//                 paddingHorizontal: 15,
//                 paddingVertical: 10,
//                 borderRadius: 8,
//               }}>
//               <Text
//                 style={{ color: "white", fontSize: 14, fontWeight: "bold" }}
//                 onPress={decreaseTimeLimit}>
//                 빠른걸음 ↑
//               </Text>
//             </View>

//             <View
//               style={{
//                 backgroundColor: "#fd7e14",
//                 paddingHorizontal: 15,
//                 paddingVertical: 10,
//                 borderRadius: 8,
//               }}>
//               <Text
//                 style={{ color: "white", fontSize: 14, fontWeight: "bold" }}
//                 onPress={increaseTimeLimit}>
//                 느린걸음 ↑
//               </Text>
//             </View>
//           </View>
//         </View>
//       )}

//       <View style={{ marginTop: 20, alignItems: "center" }}>
//         <Text style={{ fontSize: 12, color: "gray", textAlign: "center" }}>
//           충격 방지 + 시간 제한 + 피크/골 감지
//         </Text>
//       </View>
//     </View>
//   );
// }
