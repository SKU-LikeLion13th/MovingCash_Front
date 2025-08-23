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
import { AppState } from "react-native";

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
  const ctx = useContext(WalkingContext);
  if (!ctx) throw new Error("useWalking must be used within WalkingProvider");
  return ctx;
};

interface WalkingProviderProps {
  children: ReactNode;
}

export const WalkingProvider = ({ children }: WalkingProviderProps) => {
  // State
  const [status, setStatus] = useState<StatusType>("start");
  const [elapsed, setElapsed] = useState(0);
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [points, setPoints] = useState(0);

  // Refs (항상 최신값 미러)
  const statusRef = useRef<StatusType>(status);
  const stepsRef = useRef<number>(steps);
  const elapsedRef = useRef<number>(elapsed);
  const locationRef = useRef<LocationData | null>(location);
  const distanceRef = useRef<number>(distance);
  const paceRef = useRef<number>(pace);
  const caloriesRef = useRef<number>(calories);
  const pointsRef = useRef<number>(points);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps]);
  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);
  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);
  useEffect(() => {
    paceRef.current = pace;
  }, [pace]);
  useEffect(() => {
    caloriesRef.current = calories;
  }, [calories]);
  useEffect(() => {
    pointsRef.current = points;
  }, [points]);

  // Intervals/Timeouts/WebSocket
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // timer
  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const locationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = useRef(1000);

  // Location/Steps
  const locationWatchRef = useRef<{ remove: () => void } | null>(null);
  const pointIndexRef = useRef(1);

  // Accelerometer vars
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

  // Utils
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
  const formatted = formatTime(elapsed);

  // 타이머
  const startTimer = () => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      // elapsedRef가 자동 증가하도록 state로 +1
      setElapsed((prev) => prev + 1);
    }, 1000);
  };
  const stopTimer = () => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  // 걸음수 리셋
  const resetSteps = () => {
    setSteps(0);
    lastAccel.current = { x: 0, y: 0, z: 0 };
    lastPeak.current = { x: 0, y: 0, z: 0 };
    wasIncreasing.current = { x: false, y: false, z: false };
    lastStepTime.current = 0;
    recentSteps.current = [];
    accelerationHistory.current = [];
  };

  // Data reset
  const resetData = () => {
    setElapsed(0);
    setDistance(0);
    setPace(0);
    setCalories(0);
    setPoints(0);
    pointIndexRef.current = 1;
    resetSteps();
  };

  // API
  const endSession = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }
      const payload = {
        totalCalories: caloriesRef.current,
        totalDistance: distanceRef.current,
        pace: paceRef.current,
        duration: formatTime(elapsedRef.current),
        points: pointsRef.current,
      };
      console.log("세션 종료 요청:", payload);

      const res = await fetch("http://movingcash.sku-sku.com/sessions/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.log("세션 종료 응답:", json);
      return json;
    } catch (e) {
      console.error("세션 종료 API 오류:", e);
    }
  };

  const startSession = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.error("토큰이 없습니다.");
        return;
      }
      const res = await fetch("http://movingcash.sku-sku.com/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify({ status: "WALKING" }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      console.log("세션 시작 응답:", json);
    } catch (e) {
      console.error("세션 시작 API 오류:", e);
    }
  };

  //  Shock/Step detection
  const isShockDetected = () => {
    if (accelerationHistory.current.length < 5) return false;
    const recent = accelerationHistory.current.slice(-5);
    const avg = recent.reduce((s, v) => s + v, 0) / recent.length;
    const cur = recent[recent.length - 1];
    return cur > avg * 2 && cur > 12;
  };

  const detectStepWithTimeLimit = (
    x: number,
    y: number,
    z: number,
    now: number
  ) => {
    const cur = { x, y, z };
    const prev = lastAccel.current;

    if (prev.x === 0 && prev.y === 0 && prev.z === 0) {
      lastAccel.current = { ...cur };
      lastPeak.current = { ...cur };
      return;
    }

    const dt = now - lastStepTime.current;
    if (dt < minStepInterval.current) {
      lastAccel.current = { ...cur };
      return;
    }

    // 1초 최대 걸음 제한
    recentSteps.current = recentSteps.current.filter((t) => now - t < 1000);
    if (recentSteps.current.length >= maxStepsPerSecond.current) {
      lastAccel.current = { ...cur };
      return;
    }

    let stepDetected = false as boolean;

    (["x", "y", "z"] as const).forEach((axis) => {
      const c = cur[axis];
      const p = prev[axis];
      const lastP = lastPeak.current[axis];

      const diff = c - p;
      const inc = diff > threshold.current;
      const dec = diff < -threshold.current;
      const wasUp = wasIncreasing.current[axis];

      if (wasUp && dec) {
        if (Math.abs(p - lastP) > minPeakDifference.current) {
          stepDetected = true;
          lastPeak.current[axis] = p;
        }
      } else if (!wasUp && inc) {
        if (Math.abs(p - lastP) > minPeakDifference.current) {
          stepDetected = true;
          lastPeak.current[axis] = p;
        }
      }

      if (inc || dec) wasIncreasing.current[axis] = inc;
    });

    if (stepDetected) {
      setSteps((prev) => prev + 1);
      lastStepTime.current = now;
      recentSteps.current.push(now);
    }

    lastAccel.current = { ...cur };
  };

  // 권한 요청
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.error("위치 권한이 거부됨");
      return false;
    }
    return true;
  };

  // Heartbeat
  const startHeartbeat = () => {
    if (heartbeatIntervalRef.current) return;
    heartbeatIntervalRef.current = setInterval(() => {
      if (statusRef.current !== "ongoing") {
        stopHeartbeat();
        return;
      }
      const ws = websocketRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: "ping" }));
        } catch (e) {
          console.error("Heartbeat 전송 실패:", e);
          if (statusRef.current === "ongoing") reconnectWebSocket();
        }
      }
    }, 30000);
  };

  const stopHeartbeat = () => {
    if (!heartbeatIntervalRef.current) return;
    clearInterval(heartbeatIntervalRef.current);
    heartbeatIntervalRef.current = null;
  };

  // 소켓 재연결
  const reconnectWebSocket = () => {
    if (statusRef.current !== "ongoing") return;
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.error("최대 재연결 시도 횟수 초과");
      return;
    }
    const delay = reconnectDelay.current;
    console.log(
      `WebSocket 재연결 시도... ${
        reconnectAttempts.current + 1
      }/${maxReconnectAttempts} (delay: ${delay}ms)`
    );
    reconnectTimeoutRef.current = setTimeout(() => {
      if (statusRef.current !== "ongoing") return;
      reconnectAttempts.current += 1;
      connectWebSocket();
      reconnectDelay.current = Math.min(reconnectDelay.current * 2, 30000);
    }, delay);
  };

  // WebSocket
  const connectWebSocket = async () => {
    try {
      // 이미 OPEN/CONNECTING이면 무시
      if (
        websocketRef.current &&
        (websocketRef.current.readyState === WebSocket.OPEN ||
          websocketRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      // 이전 소켓 정리
      if (websocketRef.current) {
        try {
          websocketRef.current.close();
        } catch {}
        websocketRef.current = null;
      }

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 필요!");
        return;
      }
      if (statusRef.current !== "ongoing") return;

      console.log("WebSocket 연결 시작...");
      const ws = new WebSocket(
        `ws://movingcash.sku-sku.com/ws/location?token=${encodeURIComponent(
          token
        )}`
      );
      websocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket 연결 성공!");
        reconnectAttempts.current = 0;
        reconnectDelay.current = 1000;
        startHeartbeat();
        startLocationSending();
      };

      ws.onmessage = (event) => {
        try {
          const data =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
          if (data?.type === "pong") {
            console.log("Pong received");
            return;
          }
          if (typeof data?.totalDistance === "number")
            setDistance(data.totalDistance);
          if (typeof data?.totalCalories === "number")
            setCalories(data.totalCalories);
          if (typeof data?.pace === "number") setPace(data.pace);
          if (typeof data?.points === "number") setPoints(data.points);
          console.log("응답 데이터:", data);
        } catch (e) {
          console.warn("WS 메시지 JSON 파싱 실패. raw 유지:", event?.data);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket 오류:", err);
      };

      ws.onclose = (ev) => {
        console.log("WebSocket 종료:", ev.code, ev.reason);
        stopHeartbeat();
        stopLocationSending();

        const normal = ev.code === 1000;
        if (statusRef.current === "ongoing" && !normal) {
          reconnectWebSocket();
        }
      };
    } catch (e) {
      console.error("WebSocket 연결 실패:", e);
      if (statusRef.current === "ongoing") reconnectWebSocket();
    }
  };

  const disconnectWebSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    stopHeartbeat();
    stopLocationSending();
    const ws = websocketRef.current;
    if (ws) {
      try {
        ws.close(1000, "Manual disconnect");
      } catch {}
    }
    websocketRef.current = null;
    reconnectAttempts.current = 0;
    reconnectDelay.current = 1000;
  };

  // Location sending (실시간 값은 ref에서 읽기)
  const startLocationSending = () => {
    if (locationIntervalRef.current) return;
    locationIntervalRef.current = setInterval(() => {
      if (statusRef.current !== "ongoing") {
        stopLocationSending();
        return;
      }
      const ws = websocketRef.current;
      const loc = locationRef.current;
      if (ws && ws.readyState === WebSocket.OPEN && loc) {
        const payload = {
          lat: loc.lat,
          lng: loc.lng,
          step: stepsRef.current,
          pointIndex: pointIndexRef.current,
          timestamp: new Date().toISOString(),
          durationStr: formatTime(elapsedRef.current), // <<< 실시간 계산
        };
        try {
          ws.send(JSON.stringify(payload));
          console.log("위치 전송:", payload);
          pointIndexRef.current += 1;
        } catch (e) {
          console.error("위치 전송 실패:", e);
          reconnectWebSocket();
        }
      }
    }, 3000);
  };

  const stopLocationSending = () => {
    if (!locationIntervalRef.current) return;
    clearInterval(locationIntervalRef.current);
    locationIntervalRef.current = null;
  };

  // 위치 추적
  const startLocationTracking = async () => {
    const ok = await requestLocationPermission();
    if (!ok) return;

    if (locationWatchRef.current) {
      try {
        locationWatchRef.current.remove();
      } catch {}
      locationWatchRef.current = null;
    }

    locationWatchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,
        distanceInterval: 5, // 5m 이상 움직여야 콜백 실행(오차 줄이기)
      },
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLoc = { lat: latitude, lng: longitude };
        setLocation(newLoc);
        // ref도 즉시 업데이트 (인터벌 지연 최소화)
        locationRef.current = newLoc;
      }
    );
  };

  const stopLocationTracking = () => {
    if (locationWatchRef.current) {
      try {
        locationWatchRef.current.remove();
      } catch {}
      locationWatchRef.current = null;
    }
  };

  // Accelerometer (만보기)
  const startAccelerometer = () => {
    Accelerometer.setUpdateInterval(50);
    return Accelerometer.addListener((d) => {
      const { x, y, z } = d;
      const now = Date.now();
      const total = Math.sqrt(x * x + y * y + z * z);
      accelerationHistory.current.push(total);
      if (accelerationHistory.current.length > maxHistoryLength) {
        accelerationHistory.current.shift();
      }
      if (!isShockDetected()) {
        detectStepWithTimeLimit(x, y, z, now);
      }
    });
  };

  // AppState
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (
        next === "active" &&
        statusRef.current === "ongoing" &&
        (!websocketRef.current ||
          websocketRef.current.readyState !== WebSocket.OPEN)
      ) {
        connectWebSocket();
      }
    });
    return () => sub?.remove();
  }, []);

  // 상태관리
  useEffect(() => {
    let accelSub: { remove: () => void } | null = null;

    if (status === "ongoing") {
      startTimer();
      if (elapsedRef.current === 0) startSession();
      connectWebSocket();
      startLocationTracking();
      accelSub = startAccelerometer();
    } else if (status === "stop") {
      stopTimer();
      stopLocationTracking();
      disconnectWebSocket();
      endSession();
    } else if (status === "finish") {
      stopTimer();
      stopLocationTracking();
      disconnectWebSocket();
      endSession();
    }

    return () => {
      if (accelSub) {
        try {
          accelSub.remove();
        } catch {}
      }
    };
  }, [status]);

  // 언마운트시 정리
  useEffect(() => {
    return () => {
      stopTimer();
      stopLocationTracking();
      disconnectWebSocket();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
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
