import Header from "src/components/Header";
import WalkingTracker from "./components/WalkingTracker";
import WalkingPoints from "./components/WalkingPoints";
import WalkingDetail from "./components/WalkingDetail";
import { View, ScrollView } from "react-native";
import { useState } from "react";

export default function Walking() {
  const [elapsed, setElapsed] = useState(0);
  const [formatted, setFormatted] = useState("00:00:00");

  return (
    <View className="flex-1 bg-[#101010]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-3">
          <Header title="Walking" />
          {/* WalkingTracker에서 시간 받아오기 */}
          <WalkingTracker
            onTimeUpdate={(sec, hhmmss) => {
              setElapsed(sec);
              setFormatted(hhmmss);
            }}
          />
          <WalkingPoints />
        </View>
      </ScrollView>

      {/* 하단 BottomSheet */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%",
        }}>
        <WalkingDetail elapsed={elapsed} formatted={formatted} />
      </View>
    </View>
  );
}

// import React, { useEffect, useRef, useState } from "react";
// import { View, Text, Button, Alert } from "react-native";
// import * as Location from "expo-location";

// export default function LocationSender() {
//   const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
//     null
//   );
//   const [isRunning, setIsRunning] = useState(false); // 실행 상태
//   const [duration, setDuration] = useState(0); // 초 단위 저장
//   const [pointIndex, setPointIndex] = useState(1);

//   const wsRef = useRef<WebSocket | null>(null);
//   const watchRef = useRef<any>(null);
//   const timerRef = useRef<any>(null);

//   // 📌 경과 시간 -> HH:MM:SS 포맷 변환
//   const formatDuration = (seconds: number) => {
//     const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
//     const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
//     const s = String(seconds % 60).padStart(2, "0");
//     return `${h}:${m}:${s}`;
//   };

//   // 📌 위치 권한 요청 + WebSocket 연결
//   const startTracking = async () => {
//     let { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== "granted") {
//       Alert.alert(
//         "위치 권한 필요",
//         "현재 위치를 확인하려면 위치 접근 권한을 허용해주세요."
//       );
//       return;
//     }

//     // WebSocket 연결 (URL은 실제 서버 주소로 변경)
//     wsRef.current = new WebSocket("wss://your-server.com/ws");

//     wsRef.current.onopen = () => {
//       console.log("✅ WebSocket 연결됨");
//     };

//     wsRef.current.onmessage = (msg) => {
//       console.log("📩 서버 응답:", msg.data);
//     };

//     wsRef.current.onerror = (err) => {
//       console.error("❌ WebSocket 오류:", err);
//     };

//     wsRef.current.onclose = () => {
//       console.log("🔌 WebSocket 연결 종료");
//     };

//     // 실시간 위치 추적
//     watchRef.current = await Location.watchPositionAsync(
//       {
//         accuracy: Location.Accuracy.High,
//         timeInterval: 3000, // 3초마다
//         distanceInterval: 1,
//       },
//       (pos) => {
//         const { latitude, longitude } = pos.coords;
//         setLocation({ lat: latitude, lng: longitude });

//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//           const payload = {
//             lat: latitude,
//             lng: longitude,
//             timestamp: new Date().toISOString(),
//             pointIndex: pointIndex,
//             step: 50, // running이어도 전송 필요
//             duration: formatDuration(duration),
//           };
//           wsRef.current.send(JSON.stringify(payload));
//           console.log("📤 위치 전송:", payload);

//           setPointIndex((prev) => prev + 1);
//         }
//       }
//     );

//     // 타이머 시작 (duration 증가)
//     timerRef.current = setInterval(() => {
//       setDuration((prev) => prev + 1);
//     }, 1000);

//     setIsRunning(true);
//   };

//   // 📌 일시정지
//   const pauseTracking = () => {
//     if (watchRef.current) {
//       watchRef.current.remove();
//       watchRef.current = null;
//     }
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//     setIsRunning(false);
//     console.log("⏸️ 위치 전송 일시정지");
//   };

//   // 📌 종료
//   const stopTracking = () => {
//     pauseTracking();
//     if (wsRef.current) {
//       wsRef.current.close();
//       wsRef.current = null;
//     }
//     setDuration(0);
//     setPointIndex(1);
//     console.log("🛑 위치 전송 종료");
//   };

//   return (
//     <View className="flex-1 justify-center items-center">
//       <Text className="mb-4">
//         {location
//           ? `📍 현재 위치: ${location.lat}, ${location.lng}`
//           : "위치 불러오는 중..."}
//       </Text>
//       <Text className="mb-4">⏱ 경과 시간: {formatDuration(duration)}</Text>
//       {!isRunning ? (
//         <Button title="▶️ 시작" onPress={startTracking} />
//       ) : (
//         <Button title="⏸ 일시정지" onPress={pauseTracking} />
//       )}
//       <Button title="🛑 종료" onPress={stopTracking} />
//     </View>
//   );
// }
