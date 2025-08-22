import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Header from "src/components/Header";
import { makeGoogleHtml } from "./GoogleHtml"; // HTML은 그리기 전담
import Constants from "expo-constants";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "App";
import axios from "axios";

const GOOGLE_KEY = (Constants.expoConfig?.extra as any)
  ?.googleMapsKey as string;
const TMAP_APP_KEY = (Constants.expoConfig?.extra as any)?.tmapKey as string;
const BASE_URL = "http://localhost:8081";

type R = RouteProp<MainStackParamList, "MovingSpotResult">;
type LatLng = { lat: number; lng: number; name?: string };

export default function MovingSpotResult() {
  const webRef = useRef<WebView>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{
    distance?: number;
    time?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);
  const [curPos, setCurPos] = useState<{
    lat: number;
    lng: number;
    acc?: number;
  } | null>(null);

  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { params } = useRoute<R>();

  const googleHtml = useMemo(() => makeGoogleHtml(GOOGLE_KEY), [GOOGLE_KEY]);
  const post = (msg: any) => webRef.current?.postMessage(JSON.stringify(msg));

  // 데모 경로 (출발/경유/도착)
  const mock = {
    routeId: 1,
    start: { name: "출발지", latitude: 37.5217894, longitude: 126.9345868 },
    waypoints: [
      { name: "학교", latitude: 37.522871, longitude: 126.934678 },
      { name: "카페A", latitude: 37.5230959, longitude: 126.932924 },
    ],
    destination: { name: "카페F", latitude: 37.520302, longitude: 126.9315344 },
  };

  // ===== RN에서 Tmap 보행자 경로 호출 =====
  async function fetchTmapPedestrianRoute(
    origin: LatLng,
    destination: LatLng,
    waypoints: LatLng[]
  ) {
    const url =
      "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json";
    const passList = (waypoints || [])
      .slice(0, 5) // 보행자 경유 최대 5개
      .map((w) => `${w.lng},${w.lat}`) // 꼭 경도,위도 순서!
      .join("_"); // 포인트 구분은 언더스코어

    const body: any = {
      startX: origin.lng,
      startY: origin.lat,
      endX: destination.lng,
      endY: destination.lat,
      reqCoordType: "WGS84GEO",
      resCoordType: "WGS84GEO",
      startName: origin.name || "START",
      endName: destination.name || "END",
    };
    if (passList.length) body.passList = passList;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        appKey: TMAP_APP_KEY,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Tmap HTTP ${res.status} ${txt}`);
    }

    const data = await res.json();
    const features = data?.features || [];

    const latlngs: { lat: number; lng: number }[] = [];
    let totalDistance = 0;
    let totalTime = 0;

    for (const f of features) {
      if (f?.properties?.totalDistance != null)
        totalDistance = f.properties.totalDistance;
      if (f?.properties?.totalTime != null) totalTime = f.properties.totalTime;

      const g = f?.geometry;
      if (!g) continue;

      if (g.type === "LineString") {
        g.coordinates.forEach((c: number[]) => {
          if (Array.isArray(c) && c.length >= 2)
            latlngs.push({ lat: c[1], lng: c[0] });
        });
      } else if (g.type === "MultiLineString") {
        g.coordinates.forEach((line: number[][]) => {
          line.forEach((c: number[]) => {
            if (Array.isArray(c) && c.length >= 2)
              latlngs.push({ lat: c[1], lng: c[0] });
          });
        });
      }
    }

    if (latlngs.length < 2) throw new Error("No route coordinates");
    return { latlngs, totalDistance, totalTime };
  }

  // ===== 지도 준비되면 경로 요청(RN fetch → WebView draw) =====
  useEffect(() => {
    if (!mapReady) return;

    const origin: LatLng = {
      lat: mock.start.latitude,
      lng: mock.start.longitude,
      name: mock.start.name,
    };
    const destination: LatLng = {
      lat: mock.destination.latitude,
      lng: mock.destination.longitude,
      name: mock.destination.name,
    };
    const waypoints: LatLng[] = mock.waypoints.map((w) => ({
      lat: w.latitude,
      lng: w.longitude,
      name: w.name,
    }));

    (async () => {
      try {
        const { latlngs, totalDistance, totalTime } =
          await fetchTmapPedestrianRoute(origin, destination, waypoints);
        post({
          type: "DRAW_ROUTE",
          latlngs,
          origin,
          destination,
          waypoints,
          totalDistance,
          totalTime,
        });
        setRouteInfo({ distance: totalDistance, time: totalTime });
      } catch (e: any) {
        console.warn("MAP ERROR (RN fetch):", e?.message || String(e));
        post({
          type: "DRAW_STRAIGHT",
          points: [origin, ...waypoints, destination],
        });
      }
    })();
  }, [mapReady]);

  // ===== 위치 권한 + 현재 위치 추적 =====
  useEffect(() => {
    let mounted = true;
    const slowTimer = setTimeout(() => setIsSlow(true), 4000);

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoading(false);
          return;
        }
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

        watcherRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000,
            distanceInterval: 5,
            mayShowUserSettingsDialog: true,
          },
          (loc) => {
            const np = {
              lat: loc.coords.latitude,
              lng: loc.coords.longitude,
              acc: loc.coords.accuracy ?? undefined,
            };
            setCurPos(np);
            post({
              type: "SET_CURRENT",
              lat: np.lat,
              lng: np.lng,
              accuracy: np.acc,
              follow: false,
            });
            if (loading) setLoading(false);
          }
        );
      } catch (e) {
        console.warn("getCurrentPositionAsync error", e);
        post({ type: "MOVE_CAMERA", lat: 37.5665, lng: 126.978, zoom: 12 });
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
      watcherRef.current?.remove();
      watcherRef.current = null;
      clearTimeout(slowTimer);
    };
  }, []);

  // ===== WebView 메시지 =====
  const handleWebViewMessage = (e: any) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "READY") {
        setMapReady(true);
      } else if (msg.type === "ERROR") {
        console.warn("MAP ERROR:", msg);
      }
    } catch (error) {
      console.warn("Failed to parse WebView message:", error);
    }
  };

  const {
    themes = [],
    difficulty = [],
    prefs = [],
  } = params || {};
  const chips = [...themes, ...difficulty, ...prefs];

  return (
    <View className="h-full bg-[#101010]">
      <Header title="무빙과 함께 걷는 ai 추천 산책 코스" />

      {/* 선택 요약 칩 */}
      <View className="items-center">
        <Text className="text-white text-[18px] font-bold mt-2">
          무빙과 함께 걸어볼까요?
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="my-6 mb-8"
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {chips.map((item, i) => (
            <View
              key={`${item.label}-${i}`}
              className="bg-[#FFFFFF] border-[#FF6B00] border px-4 py-2 mr-2 rounded-full flex-row items-center"
            >
              {!!item.emoji && <Text className="mr-1">{item.emoji}</Text>}
              <Text className="text-black">{item.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 지도 */}
      <View className="flex-1 mx-3">
        <WebView
          ref={webRef}
          style={{ flex: 1, zIndex: 0}}
          source={{ html: googleHtml, baseUrl: BASE_URL }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          onMessage={handleWebViewMessage}
        />
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>딱 맞는 산책 코스를 준비하고 있어요</Text>
          </View>
        )}
      </View>

      {/* 시작하기 */}
      <View className="my-8 items-center"
      >
        <Pressable
          onPress={onStart}
          className="bg-[#E9690D] h-12 w-[85%] justify-center items-center rounded-full"
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>시작하기</Text>
        </Pressable>
      </View>
    </View>
  );

  function onStart() {
    if (!curPos) return;

    const origin: LatLng = {
      lat: curPos.lat,
      lng: curPos.lng,
      name: "현재위치",
    };
    const destination: LatLng = {
      lat: mock.destination.latitude,
      lng: mock.destination.longitude,
      name: mock.destination.name,
    };
    const waypoints: LatLng[] = mock.waypoints.map((w) => ({
      lat: w.latitude,
      lng: w.longitude,
      name: w.name,
    }));

    (async () => {
      try {
        const { latlngs, totalDistance, totalTime } =
          await fetchTmapPedestrianRoute(origin, destination, waypoints);

        post({
          type: "DRAW_ROUTE",
          latlngs,
          origin,
          destination,
          waypoints,
          totalDistance,
          totalTime,
        });
        setRouteInfo({ distance: totalDistance, time: totalTime });
      } catch (e: any) {
        console.warn("MAP ERROR (RN fetch-start):", e?.message || String(e));
        // 실패 시 직선 폴리라인 폴백
        post({
          type: "DRAW_STRAIGHT",
          points: [origin, ...waypoints, destination],
        });
      }
    })();
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, marginTop: 12, fontWeight: "800" }
});
