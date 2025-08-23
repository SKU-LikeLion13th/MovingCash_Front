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
import { makeGoogleHtml } from "./GoogleHtml";
import Constants from "expo-constants";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "App";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const GOOGLE_KEY = (Constants.expoConfig?.extra as any)?.googleMapsKey as string;
const TMAP_APP_KEY = (Constants.expoConfig?.extra as any)?.tmapKey as string;
const BASE_URL = "http://localhost:8081";
const COURSES_URL = "http://movingcash.sku-sku.com/movingspot/courses";

type R = RouteProp<MainStackParamList, "MovingSpotResult">;
type LatLng = { lat: number; lng: number; name?: string };

export default function MovingSpotResult() {
  const webRef = useRef<WebView>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance?: number; time?: number }>({});
  const [loading, setLoading] = useState(true);
  const [curPos, setCurPos] = useState<{ lat: number; lng: number; acc?: number } | null>(null);
  const [started, setStarted] = useState(false);

  const fetchedOnceRef = useRef(false);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { params } = useRoute<R>();

  const googleHtml = useMemo(() => makeGoogleHtml(GOOGLE_KEY), [GOOGLE_KEY]);
  const post = (msg: any) => webRef.current?.postMessage(JSON.stringify(msg));

  function pickLat(obj: any): number {
    return Number(obj?.lat ?? obj?.latitude);
  }
  function pickLng(obj: any): number {
    return Number(obj?.lng ?? obj?.longitude);
  }
  function toLatLng(p: any): LatLng {
    return { lat: pickLat(p), lng: pickLng(p), name: p?.name ? String(p.name) : undefined };
  }

  async function fetchTmapPedestrianRoute(origin: LatLng, destination: LatLng, waypoints: LatLng[]) {
    const url = "https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json";
    const passList = (waypoints || []).slice(0, 5).map((w) => `${w.lng},${w.lat}`).join("_");

    const body: any = {
      startX: origin.lng, startY: origin.lat,
      endX: destination.lng, endY: destination.lat,
      reqCoordType: "WGS84GEO", resCoordType: "WGS84GEO",
      startName: origin.name || "START", endName: destination.name || "END",
    };
    if (passList.length) body.passList = passList;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", appKey: TMAP_APP_KEY },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Tmap HTTP ${res.status} ${await res.text()}`);

    const data = await res.json();
    const features = data?.features || [];
    const latlngs: { lat: number; lng: number }[] = [];
    let totalDistance = 0, totalTime = 0;

    for (const f of features) {
      if (f?.properties?.totalDistance != null) totalDistance = f.properties.totalDistance;
      if (f?.properties?.totalTime != null) totalTime = f.properties.totalTime;
      const g = f?.geometry;
      if (!g) continue;

      if (g.type === "LineString") {
        g.coordinates.forEach((c: number[]) => { if (c?.length >= 2) latlngs.push({ lat: c[1], lng: c[0] }); });
      } else if (g.type === "MultiLineString") {
        g.coordinates.forEach((line: number[][]) => {
          line.forEach((c: number[]) => { if (c?.length >= 2) latlngs.push({ lat: c[1], lng: c[0] }); });
        });
      }
    }
    if (latlngs.length < 2) throw new Error("No route coordinates");
    return { latlngs, totalDistance, totalTime };
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") { setLoading(false); return; }
        const cur = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!mounted) return;

        const p = { lat: cur.coords.latitude, lng: cur.coords.longitude, acc: cur.coords.accuracy ?? undefined };
        setCurPos(p);
        post({ type: "SET_CURRENT", lat: p.lat, lng: p.lng, accuracy: p.acc, follow: true });
        setLoading(false);

        watcherRef.current = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, timeInterval: 3000, distanceInterval: 5, mayShowUserSettingsDialog: true },
          (loc) => {
            const np = { lat: loc.coords.latitude, lng: loc.coords.longitude, acc: loc.coords.accuracy ?? undefined };
            setCurPos(np);
            post({ type: "SET_CURRENT", lat: np.lat, lng: np.lng, accuracy: np.acc, follow: false });
            if (loading) setLoading(false);
          }
        );
      } catch (e) {
        post({ type: "MOVE_CAMERA", lat: 37.5665, lng: 126.978, zoom: 12 });
        setLoading(false);
      }
    })();

    return () => { mounted = false; watcherRef.current?.remove(); watcherRef.current = null; };
  }, []);

  const handleWebViewMessage = (e: any) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === "READY") setMapReady(true);
      else if (msg.type === "ERROR") console.warn("MAP ERROR:", msg);
      // else if (msg.type === "MARKER_CLICK") { /* 바텀시트 열기 등 */ }
    } catch {}
  };

  const { themes = [], difficulty = [], prefs = [] } = params || {};
  const chips = [...themes, ...difficulty, ...prefs];

  useEffect(() => {
    if (!mapReady || !curPos) return;
    if (fetchedOnceRef.current) return;
    fetchedOnceRef.current = true;
    fetchAndDrawCourse().catch((e) => console.warn("AUTO COURSE DRAW FAILED:", e?.message || String(e)));
  }, [mapReady, curPos]);

  async function fetchAndDrawCourse() {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) { console.warn("토큰이 없습니다. 로그인 필요!"); setLoading(false); return; }

      const payload = {
        lat: curPos!.lat, lng: curPos!.lng,
        theme: (themes || []).map((t: any) => t.label),
        difficulty: (difficulty || []).map((d: any) => d.label),
        condition: (prefs || []).map((p: any) => p.label),
      };
      const authHeader = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      const res = await axios.post(COURSES_URL, payload, {
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        validateStatus: () => true,
      });
      if (res.status !== 200 || !Array.isArray(res.data) || res.data.length === 0) {
        console.warn("COURSES ERROR:", res.status, res.data); setLoading(false); return;
      }

      const r = res.data[0];
      const origin: LatLng = toLatLng(r?.start ?? {});
      const destination: LatLng = toLatLng(r?.destination ?? {});
      const waypoints: LatLng[] = Array.isArray(r?.waypoints) ? r.waypoints.map(toLatLng) : [];

      if (![origin, destination].every(p => isFinite(p.lat) && isFinite(p.lng))) {
        console.warn("Invalid coordinates in response:", { origin, destination }); setLoading(false); return;
      }

      try {
        const { latlngs, totalDistance, totalTime } =
          await fetchTmapPedestrianRoute(origin, destination, waypoints);

        post({ type: "DRAW_ROUTE", latlngs, origin, destination, waypoints, totalDistance, totalTime });
        setRouteInfo({ distance: totalDistance, time: totalTime });
      } catch (e: any) {
        console.warn("MAP ERROR (RN fetch):", e?.message || String(e));
        post({ type: "DRAW_STRAIGHT", points: [origin, ...waypoints, destination] });
      }
    } catch (e: any) {
      console.warn("COURSES REQUEST FAILED:", e?.message || String(e));
    } finally { setLoading(false); }
  }

  function onPrimaryAction() {
    if (!started) { setStarted(true); return; }
    navigation.navigate("Main");
  }

  return (
    <View className="h-full bg-[#101010]">
      {!started ? (<Header title="무빙과 함께 걷는 ai 추천 산책 코스" />) : (<Header title="Moving 스팟" />)}

      {!started && (
        <View className="items-center">
          <Text className="text-white text-[18px] font-bold mt-2">무빙과 함께 걸어볼까요?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-6 mb-8" contentContainerStyle={{ paddingHorizontal: 16 }}>
            {chips.map((item, i) => (
              <View key={`${item.label}-${i}`} className="bg-[#FFFFFF] border-[#FF6B00] border px-4 py-2 mr-2 rounded-full flex-row items-center">
                {!!item.emoji && <Text className="mr-1">{item.emoji}</Text>}
                <Text className="text-black">{item.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className={`flex-1 ${started ? "" : "mx-3"}`}>
        <WebView
          ref={webRef}
          style={{ flex: 1, zIndex: 0 }}
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

      <View className={`items-center ${started ? "mb-3 mt-5" : "my-8"}`}>
        <Pressable
          onPress={onPrimaryAction}
          disabled={!mapReady}
          className="bg-[#E9690D] h-12 w-[85%] justify-center items-center rounded-full"
          style={{ opacity: mapReady ? 1 : 0.5 }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>{started ? "종료하기" : "시작하기"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute", left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center", paddingHorizontal: 16,
  },
  title: { color: "#fff", fontSize: 20, marginTop: 12, fontWeight: "800" },
});
