import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";

export type StatusType = "start" | "ongoing" | "stop" | "finish";

interface RunningData {
  status: StatusType;
  elapsed: number;
  formatted: string;
  distance: number;
  pace: number;
  calories: number;
}

interface RunningContextType extends RunningData {
  setStatus: (status: StatusType) => void;
  startTimer: () => void;
  stopTimer: () => void;
  resetData: () => void;
}

const RunningContext = createContext<RunningContextType | undefined>(undefined);

export const useRunning = () => {
  const context = useContext(RunningContext);
  if (!context) {
    throw new Error("useRunning must be used within RunningProvider");
  }
  return context;
};

interface RunningProviderProps {
  children: ReactNode;
}

export const RunningProvider = ({ children }: RunningProviderProps) => {
  const [status, setStatus] = useState<StatusType>("start");
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pace, setPace] = useState(0);
  const [calories, setCalories] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

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

  /* 데이터 초기화 */
  const resetData = () => {
    setElapsed(0);
    setDistance(0);
    setPace(0);
    setCalories(0);
  };

  /* 상태 변화에 따른 타이머 및 웹소켓 제어 */
  useEffect(() => {
    if (status === "ongoing") {
      startTimer();
      // 웹소켓 연결 시작
      // connectWebSocket();
    } else if (status === "stop" || status === "finish") {
      stopTimer();
      // 웹소켓 연결 종료
      // disconnectWebSocket();
    }
  }, [status]);

  /* 웹소켓 연결 (아직 구현 덜 됨) */
  const connectWebSocket = () => {
    try {
      // websocketRef.current = new WebSocket('웹소켓 url');
      //
      // websocketRef.current.onmessage = (event) => {
      //   const data = JSON.parse(event.data);
      //   setDistance(data.distance);
      //   setPace(data.pace);
      //   setCalories(data.calories);
      // };
    } catch (error) {
      console.error("WebSocket connection failed:", error);
    }
  };

  const disconnectWebSocket = () => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  };

  /* 컴포넌트 언마운트 시 정리 */
  useEffect(() => {
    return () => {
      stopTimer();
      disconnectWebSocket();
    };
  }, []);

  const value: RunningContextType = {
    status,
    elapsed,
    formatted,
    distance,
    pace,
    calories,
    setStatus,
    startTimer,
    stopTimer,
    resetData,
  };

  return (
    <RunningContext.Provider value={value}>{children}</RunningContext.Provider>
  );
};
