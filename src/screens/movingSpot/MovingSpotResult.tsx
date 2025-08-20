import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Header from "src/components/Header";
import { makeGoogleHtml } from "./GoogleHtml";
import Constants from "expo-constants";

// 네비게이션 (선택 칩 표시 위해 파라미터 받음)
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "App";

const BROWSER_KEY = (Constants.expoConfig?.extra as any)
  ?.googleMapsKey as string;
const BASE_URL = "http://localhost:8081";

type R = RouteProp<MainStackParamList, "MovingSpotResult">;

export default function MovingSpotResult() {
  const webRef = useRef<WebView>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const googleHtml = useMemo(() => makeGoogleHtml(BROWSER_KEY), [BROWSER_KEY]);
  const post = (msg: any) => webRef.current?.postMessage(JSON.stringify(msg));

  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { params } = useRoute<R>(); 

  // 로딩/현재 위치
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [curPos, setCurPos] = useState<{ lat: number; lng: number; acc?: number } | null>(null);

  //API 연결 전 임시 경로(미리보기용)
  const mock = {
    routeId: 1,
    start: { name: "출발지", latitude: 37.5217894, longitude: 126.9345868 },
    waypoints: [
      { name: "학교", latitude: 37.522871, longitude: 126.934678 },
      { name: "카페A", latitude: 37.5230959, longitude: 126.932924 },
    ],
    destination: { name: "카페F", latitude: 37.520302, longitude: 126.9315344 },
  };

  // 권한 + 현재 위치 추적
  useEffect(() => {
    let mounted = true;
    const slowTimer = setTimeout(() => setIsSlow(true), 4000);

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }

      try {
        const cur = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;

        const p = {
          lat: cur.coords.latitude,
          lng: cur.coords.longitude,
          acc: cur.coords.accuracy ?? undefined,
        };
        setCurPos(p);
        post({
          type: "SET_CURRENT",
          lat: p.lat,
          lng: p.lng,
          accuracy: p.acc,
          follow: true,
        });
        setLoading(false);
      } catch (e) {
        console.warn("getCurrentPositionAsync error", e);
        post({ type: "MOVE_CAMERA", lat: 37.5665, lng: 126.978, zoom: 12 });
        setLoading(false);
      }

      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 3000,
          distanceInterval: 5,
          mayShowUserSettingsDialog: true,
        },
        (loc) => {
          const p = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            acc: loc.coords.accuracy ?? undefined, 
          };
          setCurPos(p);
          post({
            type: "SET_CURRENT",
            lat: p.lat,
            lng: p.lng,
            accuracy: p.acc,
            follow: false,
          });
          if (loading) setLoading(false);
        }
      );
    })();

    return () => {
      watcherRef.current?.remove();
      watcherRef.current = null;
      clearTimeout(slowTimer);
    };
  }, []);

  useEffect(() => {
    if (!mapReady) return;
    post({
      type: "FIND_DIRECTIONS",
      origin: { lat: mock.start.latitude, lng: mock.start.longitude },
      destination: {
        lat: mock.destination.latitude,
        lng: mock.destination.longitude,
      },
      waypoints: mock.waypoints.map((w) => ({ lat: w.latitude, lng: w.longitude })),
      mode: "WALKING",
    });
  }, [mapReady]);

  const onStart = () => {
    if (!curPos) return;
    post({
      type: "SET_CURRENT",
      lat: curPos.lat,
      lng: curPos.lng,
      accuracy: curPos.acc,
      follow: true,
    });
    post({
      type: "FIND_DIRECTIONS",
      origin: { lat: curPos.lat, lng: curPos.lng },
      destination: {
        lat: mock.destination.latitude,
        lng: mock.destination.longitude,
      },
      waypoints: mock.waypoints.map((w) => ({ lat: w.latitude, lng: w.longitude })),
      mode: "WALKING",
    });
  };

  // 칩 목록(난이도 + 테마 + 취향)
  const chips: string[] = [
    ...(params?.difficulty ?? []),
    ...(params?.themes ?? []),
    ...(params?.prefs ?? []),
  ];

  return (
    <View style={{ flex: 1 }}>
      <Header title="무빙과 함께 걷는 ai 추천 산책 코스" />

      {/* 선택 요약 칩 */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {chips.map((t, i) => (
            <View
              key={`${t}-${i}`}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                backgroundColor: "#2E2E31",
                borderRadius: 999,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 지도 */}
      <View style={{ flex: 1 }}>
        <WebView
          ref={webRef}
          style={{ flex: 1, zIndex: 0 }}
          source={{ html: googleHtml, baseUrl: BASE_URL }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          onMessage={(e) => {
            try {
              const msg = JSON.parse(e.nativeEvent.data);
              if (msg.type === "READY") setMapReady(true);
              if (msg.type === "ERROR") console.warn("MAP ERROR:", msg);
            } catch {}
          }}
        />

        {/* 로딩 오버레이 */}
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>현재 위치 찾는 중…</Text>
            <Text style={styles.sub}>
              {isSlow ? "GPS가 조금 느리네요. 잠시만요!" : "위치 정보 가져오는 중"}
            </Text>
          </View>
        )}
      </View>

      {/* 시작하기 버튼 */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: "#101010",
        }}
      >
        <Pressable
          onPress={onStart}
          style={{
            height: 52,
            borderRadius: 16,
            backgroundColor: "#FF6B00",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>시작하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 16, marginTop: 12, fontWeight: "600" },
  sub: { color: "#eee", marginTop: 6 },
});
