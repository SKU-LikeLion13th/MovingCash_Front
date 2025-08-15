import React from "react";
import { View } from "react-native";

import Header from "src/components/Header";
import WalkingTracker from "./components/WalkingTracker";
import WalkingPoints from "./components/WalkingPoints";

export default function Running() {
  return (
    <View className="flex-1 bg-[#101010] px-3">
      <Header title="Walking" />

      <WalkingTracker />

      <WalkingPoints />
    </View>
  );
}

// import React, { useState, useEffect } from "react";
// import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
// import { Pedometer } from "expo-sensors";

// type Status = "stopped" | "running" | "paused";

// export default function Walking() {
//   // 컴포넌트 상태 관리
//   const [status, setStatus] = useState<Status>("stopped");
//   const [subscription, setSubscription] = useState<{ remove: () => void } | null>(null);

//   // 걸음 수 관리
//   // 일시정지 전까지 누적된 걸음 수
//   const [stepsCountedBeforePause, setStepsCountedBeforePause] = useState(0);
//   // 현재 세션(시작 또는 이어걷기 이후)에서 측정된 걸음 수
//   const [sessionSteps, setSessionSteps] = useState(0);

//   // 화면에 표시될 총 걸음 수
//   const totalSteps = stepsCountedBeforePause + sessionSteps;

//   // 컴포넌트가 언마운트될 때 구독 해제
//   useEffect(() => {
//     return () => {
//       if (subscription) {
//         subscription.remove();
//       }
//     };
//   }, [subscription]);

//   // Pedometer 구독을 시작하는 함수
//   const subscribe = async () => {
//     const isAvailable = await Pedometer.isAvailableAsync();
//     if (!isAvailable) {
//       // 센서 사용 불가능 처리 (예: 에러 메시지 표시)
//       console.log("Pedometer is not available on this device.");
//       return;
//     }

//     const { status } = await Pedometer.requestPermissionsAsync();
//     if (status !== "granted") {
//       // 권한 거부 처리
//       console.log("Pedometer permission not granted.");
//       return;
//     }

//     const newSubscription = Pedometer.watchStepCount((result) => {
//       // 이 콜백은 구독 시작 후부터의 걸음 수를 반환 (result.steps)
//       setSessionSteps(result.steps);
//     });
//     setSubscription(newSubscription);
//   };

//   // Pedometer 구독을 해제하는 함수
//   const unsubscribe = () => {
//     if (subscription) {
//       subscription.remove();
//       setSubscription(null);
//     }
//   };

//   // '시작' 버튼 핸들러
//   const handleStart = () => {
//     setStepsCountedBeforePause(0);
//     setSessionSteps(0);
//     setStatus("running");
//     subscribe();
//   };

//   // '일시정지' 버튼 핸들러
//   const handlePause = () => {
//     // 현재까지의 총 걸음 수를 '일시정지 전 걸음'으로 저장
//     setStepsCountedBeforePause(totalSteps);
//     // 현재 세션 걸음 수는 0으로 초기화
//     setSessionSteps(0);
//     setStatus("paused");
//     unsubscribe();
//   };

//   // '이어걷기' 버튼 핸들러
//   const handleResume = () => {
//     setStatus("running");
//     subscribe(); // 새 구독 시작 (sessionSteps는 0부터 다시 시작)
//   };

//   // '정지' 버튼 핸들러
//   const handleStop = () => {
//     setStepsCountedBeforePause(0);
//     setSessionSteps(0);
//     setStatus("stopped");
//     unsubscribe();
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.stepCounter}>{totalSteps}</Text>
//       <Text style={styles.stepLabel}>걸음</Text>

//       <View style={styles.buttonContainer}>
//         {status === "stopped" && (
//           <TouchableOpacity
//             style={[styles.button, styles.startButton]}
//             onPress={handleStart}>
//             <Text style={styles.buttonText}>시작</Text>
//           </TouchableOpacity>
//         )}

//         {status === "running" && (
//           <TouchableOpacity
//             style={[styles.button, styles.pauseButton]}
//             onPress={handlePause}>
//             <Text style={styles.buttonText}>일시정지</Text>
//           </TouchableOpacity>
//         )}

//         {status === "paused" && (
//           <>
//             <TouchableOpacity
//               style={[styles.button, styles.resumeButton]}
//               onPress={handleResume}>
//               <Text style={styles.buttonText}>이어걷기</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, styles.stopButton]}
//               onPress={handleStop}>
//               <Text style={styles.buttonText}>정지</Text>
//             </TouchableOpacity>
//           </>
//         )}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f0f0f0",
//   },
//   stepCounter: {
//     fontSize: 80,
//     fontWeight: "bold",
//     color: "#333",
//   },
//   stepLabel: {
//     fontSize: 24,
//     color: "#666",
//     marginBottom: 60,
//   },
//   buttonContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     width: "80%",
//   },
//   button: {
//     paddingVertical: 15,
//     paddingHorizontal: 30,
//     borderRadius: 30,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   buttonText: {
//     color: "white",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   startButton: {
//     backgroundColor: "#28a745", // Green
//     width: "100%",
//   },
//   pauseButton: {
//     backgroundColor: "#ffc107", // Yellow
//     width: "100%",
//   },
//   resumeButton: {
//     backgroundColor: "#17a2b8", // Teal
//   },
//   stopButton: {
//     backgroundColor: "#dc3545", // Red
//   },
// });
