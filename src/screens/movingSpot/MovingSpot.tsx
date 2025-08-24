import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Header from "src/components/Header";
import { makeGoogleHtml } from "./GoogleHtml";
import Search from "../../../assets/images/MovingSpot/Search.svg";
import Constants from "expo-constants";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "App";

import MapActionButtons from "../../components/MapActionBtn";
import KeywordOverlay from "../../components/KeywordOverlay";

const BROWSER_KEY = (Constants.expoConfig?.extra as any)
  ?.googleMapsKey as string;
const BASE_URL = "http://localhost:8081";

type LatLng = { lat: number; lng: number };

export default function MovingSpot() {
  const webRef = useRef<WebView>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const googleHtml = useMemo(() => makeGoogleHtml(BROWSER_KEY), [BROWSER_KEY]);

  const [curPos, setCurPos] = useState<LatLng | null>(null);
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["10%", "20%", "42%"], []);

  const post = (msg: any) => webRef.current?.postMessage(JSON.stringify(msg));

  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLabel, setSearchLabel] = useState<string>("");

  const [keywordOpen, setKeywordOpen] = useState(false);
  const [customKeyword, setCustomKeyword] = useState("");

  useEffect(() => {
    let mounted = true;
    const slowTimer = setTimeout(() => setIsSlow(true), 4000);

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        setLoading(false);
        return;
      }

      try {
        const cur = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCurPos({ lat: cur.coords.latitude, lng: cur.coords.longitude });
        if (!mounted) return;

        post({
          type: "SET_CURRENT",
          lat: cur.coords.latitude,
          lng: cur.coords.longitude,
          accuracy: cur.coords.accuracy,
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
          setCurPos({ lat: loc.coords.latitude, lng: loc.coords.longitude });
          post({
            type: "SET_CURRENT",
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            follow: false,
          });
          if (loading) setLoading(false);
        }
      );
    })();

    return () => {
      mounted = false;
      watcherRef.current?.remove();
      watcherRef.current = null;
      clearTimeout(slowTimer);
    };
  }, []);

  const cats = [
    {
      key: "food",
      label: "맛집",
      image: require("../../../assets/images/MovingSpot/Store.png"),
      style: "w-[65px] h-[50px] mt-[5px] mb-[2px]",
    },
    {
      key: "cafe",
      label: "카페",
      image: require("../../../assets/images/MovingSpot/Cafe.png"),
      style: "w-[50px] h-[50px] mb-[7px]",
    },
    {
      key: "fun",
      label: "놀거리",
      image: require("../../../assets/images/MovingSpot/Game.png"),
      style: "w-[50px] h-[50px] mb-[5px]",
    },
  ] as const;

  const EMOJI_MAP: Record<"food" | "cafe" | "fun", string> = {
    food: "🍽️",
    cafe: "☕",
    fun: "🎮",
  };

  const QUERY_MAP: Record<"food" | "cafe" | "fun", string> = {
    food: "맛집",
    cafe: "카페",
    fun: "놀거리",
  };

  async function handleCategoryPress(
    type: "food" | "cafe" | "fun",
    queryOverride?: string
  ) {
    if (!curPos) {
      console.warn("현재 위치 미확인");
      return;
    }

    const query = (queryOverride && queryOverride.trim()) || QUERY_MAP[type];

    const label = `${query} 찾는 중…`;
    setSearchLabel(label);
    setSearchLoading(true);

    try {
      const payload = {
        query,
        lat: curPos.lat,
        lng: curPos.lng,
        radius: 1000,
        topK: 5,
        page: 3,
      };

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 필요!");
        return;
      }

      const res = await axios.post(
        "http://movingcash.sku-sku.com/movingspot/places",
        payload,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          validateStatus: (s) => s === 200,
        }
      );

      if (!Array.isArray(res.data)) {
        console.warn("DATA SHAPE ERROR");
        return;
      }

      const markers = (res.data as Array<any>)
        .slice(0, payload.topK)
        .map((p) => {
          const lat = Number(p.lat ?? p.latitude);
          const lng = Number(p.lng ?? p.longitude);
          const rawRating = Number(
            p.rating ?? p.rate ?? p.score ?? p.star ?? NaN
          );
          const rating = Number.isFinite(rawRating)
            ? Number(rawRating).toFixed(1)
            : "";

          return {
            lat,
            lng,
            title: String(p.name ?? ""),
            subtitle: String(p.address ?? ""),
            rating,
            // 커스텀 키워드면 🎯, 아니면 기존 이모지 유지
            emoji: queryOverride ? "🎯" : EMOJI_MAP[type],
          };
        })
        .filter((m) => Number.isFinite(m.lat) && Number.isFinite(m.lng));

      post({ type: "SET_MARKERS", markers, fit: true });
    } catch (e: any) {
      console.warn("SEARCH REQ ERROR:", e?.message || String(e));
    } finally {
      setSearchLoading(false);
      setSearchLabel("");
    }
  }
  //버튼 두 개 (추천 초기화 / 현재 위치 중앙으로 )
  const resetRecommended = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 필요!");
        return;
      }
      await axios.post(
        "http://movingcash.sku-sku.com/movingspot/refresh",
        {},
        {
          headers: {
            Authorization: `${token}`, // Bearer 불필요
            "Content-Type": "application/json",
          },
          validateStatus: () => true,
        }
      );
      // 마커 초기화
      post({ type: "SET_MARKERS", markers: [] });
    } catch (e: any) {
      console.warn("REFRESH ERROR:", e?.message || String(e));
    }
  };

  const centerToCurrent = () => {
    if (!curPos) return;
    post({ type: "MOVE_CAMERA", lat: curPos.lat, lng: curPos.lng, zoom: 16 });
  };

  return (
    <View className="h-full bg-[#101010]">
      <View className="h-full mt-8">
        <Header title="Moving 스팟" />
        <WebView
          ref={webRef}
          className="z-0"
          style={{ flex: 1, zIndex: 0 }}
          source={{ html: googleHtml, baseUrl: BASE_URL }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
        />

        {(loading || searchLoading) && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>
              {searchLoading ? searchLabel : "현재 위치 찾는 중…"}
            </Text>
            {!searchLoading && (
              <>
                <Text style={styles.sub}>
                  {isSlow
                    ? "GPS가 조금 느리네요. 잠시만요!"
                    : "위치 정보 가져오는 중"}
                </Text>
                {isSlow && (
                  <Pressable
                    style={styles.btn}
                    onPress={() => setLoading(false)}
                  >
                    <Text style={styles.btnText}>그냥 지도부터 볼래</Text>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}

        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          backgroundStyle={{
            backgroundColor: "#1A1A1C",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
          handleComponent={() => (
            <MapActionButtons
              variant="sheetFloat"
              showReset
              onReset={resetRecommended}
              onLocate={centerToCurrent}
            />
          )}
        >
          <BottomSheetScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 15 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full flex-row justify-center">
              {cats.map((c) => (
                <Pressable
                  key={c.key}
                  className="bg-[#2E2E31] w-[30%] mx-2 p-3 rounded-3xl justify-center"
                  onPress={() => {
                    if (c.key === "fun") {
                      setCustomKeyword("");
                      setKeywordOpen(true);
                    } else {
                      handleCategoryPress(c.key as "food" | "cafe");
                    }
                  }}
                  disabled={searchLoading}
                  style={{ opacity: searchLoading ? 0.6 : 1 }}
                >
                  <View className="flex-row justify-between">
                    <Image
                      source={c.image}
                      className={c.style}
                      resizeMode="contain"
                    />
                    <Search />
                  </View>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {c.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              onPress={() => {
                sheetRef.current?.snapToIndex?.(0);
                navigation.navigate("Onboarding");
              }}
            >
              <Image
                source={require("../../../assets/images/MovingSpot/MovingBtn.png")}
                className="w-[100%] h-[100%] mt-1"
                resizeMode="contain"
              />
            </Pressable>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
      <KeywordOverlay
        open={keywordOpen}
        initial={customKeyword}
        onClose={() => setKeywordOpen(false)}
        onSubmit={(kw) => {
          setCustomKeyword(kw);
          handleCategoryPress("fun", kw);
        }}
      />
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
  btn: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111",
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontWeight: "600" },
});
