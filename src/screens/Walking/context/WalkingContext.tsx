import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import * as Location from "expo-location";
import { Accelerometer } from "expo-sensors";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type StatusType = "start" | "ongoing" | "stop" | "finish";

interface LocationData {
  lat: number;
  lng: number;
}

interface WalkingData {
  status: StatusType;
  elapsed: number;
  formatted: string;
  steps: number;
  distance: number;
  pace: number;
  calories: number;
  location: LocationData | null;
  points: number;
}

interface WalkingContextType extends WalkingData {
  setStatus: (status: StatusType) => void;
  resetData: () => void;
}

const WalkingContext = createContext<WalkingContextType | undefined>(undefined);

export const useWalking = () => {
  const context = useContext(WalkingContext);
  if (!context) {
    throw new Error("useWalking must be used within WalkingProvider");
  }
  return context;
};

interface WalkingProviderProps {
  children: ReactNode;
}

export const WalkingProvider = ({ children }: WalkingProviderProps) => {
  const [status, setStatus] = useState<StatusType>("start");
  const [elapsed, setElapsed] = useState(0);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [points, setPoints] = useState(0);

  // Timer refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // WebSocket refs
  const websocketRef = useRef<WebSocket | null>(null);
  const locationWatchRef = useRef<any>(null);
  const pointIndexRef = useRef(1);

  // Accelerometer refs (걸음수 감지)
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

  /* 시간 포맷 변환 (HH:MM:SS) */
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const formatted = formatTime(elapsed);

  /* 타이머 시작 */
  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
  };

  /* 타이머 정지 */
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
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

  /* 데이터 초기화 */
  const resetData = () => {
    setElapsed(0);
    setDistance(0);
    setPace(0);
    setCalories(0);
    setPoints(0);
    pointIndexRef.current = 1;
    resetSteps();
  };

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

  /* 위치 권한 요청 */
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("위치 권한이 거부됨");
      return false;
    }
    return true;
  };

  /* WebSocket 연결 */
  const connectWebSocket = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 필요!");
        return;
      }

      // WebSocket 연결 URL
      websocketRef.current = new WebSocket(
        `ws://movingcash.sku-sku.com/ws/location?token=${encodeURIComponent(
          token
        )}`
      );

      websocketRef.current.onopen = () => {
        console.log("WebSocket 연결 성공");
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // 서버에서 받은 데이터로 상태 업데이트
          if (data.totalDistance !== undefined) setDistance(data.totalDistance);
          if (data.totalCalories !== undefined) setCalories(data.totalCalories);
          if (data.pace !== undefined) setPace(data.pace);
          if (data.points !== undefined) setPoints(data.points);

          console.log("서버 응답:", data);
        } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
      };

      websocketRef.current.onerror = (error) => {
        console.error("WebSocket 오류:", error);
      };

      websocketRef.current.onclose = () => {
        console.log("WebSocket 연결 종료");
      };
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
    }
  };

  /* WebSocket 연결 해제 */
  const disconnectWebSocket = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  /* 위치 추적 시작 */
  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    locationWatchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000, // 3초마다
        distanceInterval: 1,
      },
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        setLocation(newLocation);

        // WebSocket으로 위치 데이터 전송
        if (
          websocketRef.current &&
          websocketRef.current.readyState === WebSocket.OPEN
        ) {
          const payload = {
            lat: latitude,
            lng: longitude,
            timestamp: new Date().toISOString(),
            pointIndex: pointIndexRef.current,
            step: steps,
            duration: formatTime(elapsed),
          };

          websocketRef.current.send(JSON.stringify(payload));
          console.log("📤 위치 전송:", payload);

          pointIndexRef.current += 1;
        }
      }
    );
  };

  /* 위치 추적 중지 */
  const stopLocationTracking = () => {
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = null;
    }
  };

  /* Accelerometer 시작 */
  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(50);
    return Accelerometer.addListener((data) => {
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
  };

  /* 상태 변화에 따른 제어 */
  useEffect(() => {
    let accelerometerSubscription: any = null;

    if (status === "ongoing") {
      startTimer();
      // connectWebSocket();
      startLocationTracking();
      accelerometerSubscription = startAccelerometer();
    } else if (status === "stop" || status === "finish") {
      stopTimer();
      stopLocationTracking();
      if (status === "finish") {
        // disconnectWebSocket();
      }
    }

    return () => {
      if (accelerometerSubscription) {
        accelerometerSubscription.remove();
      }
    };
  }, [status]);

  /* 컴포넌트 언마운트 시 정리 */
  useEffect(() => {
    return () => {
      stopTimer();
      stopLocationTracking();
      // disconnectWebSocket();
    };
  }, []);

  const value: WalkingContextType = {
    status,
    elapsed,
    formatted,
    steps,
    distance,
    pace,
    calories,
    location,
    points,
    setStatus,
    resetData,
  };

  return (
    <WalkingContext.Provider value={value}>{children}</WalkingContext.Provider>
  );
};
