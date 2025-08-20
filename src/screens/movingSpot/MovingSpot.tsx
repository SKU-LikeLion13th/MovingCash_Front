import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import Header from "src/components/Header";
import { makeGoogleHtml } from "./GoogleHtml";
import Search from "../../../assets/images/MovingSpot/Search.svg";
import Constants from "expo-constants";

//바텀시트
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";

//다음페이지
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "App";

const BROWSER_KEY = (Constants.expoConfig?.extra as any)
  ?.googleMapsKey as string;
const BASE_URL = "http://localhost:8081";

export default function MovingSpot() {
  const webRef = useRef<WebView>(null);
  const watcherRef = useRef<Location.LocationSubscription | null>(null);
  const googleHtml = useMemo(() => makeGoogleHtml(BROWSER_KEY), [BROWSER_KEY]);

  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["4%", "20%", "35%"], []);

  const post = (msg: any) => webRef.current?.postMessage(JSON.stringify(msg));

  //다음페이지
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  //로딩 상태/느림 표시
  const [loading, setLoading] = useState(true);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    let mounted = true;

    //4초 지나면 “느려요” 메시지 켜기 (선택)
    const slowTimer = setTimeout(() => setIsSlow(true), 4000);

    (async () => {
      // 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission not granted");
        setLoading(false); //권한 거부 시 로딩 종료
        return;
      }

      try {
        // 현재 위치 1회
        const cur = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!mounted) return;

        post({
          type: "SET_CURRENT",
          lat: cur.coords.latitude,
          lng: cur.coords.longitude,
          accuracy: cur.coords.accuracy,
          follow: true,
        });

        setLoading(false); //첫 좌표 받으면 로딩 종료
      } catch (e) {
        console.warn("getCurrentPositionAsync error", e);
        // 상황에 따라 기본 위치로 카메라 이동만 하고 로딩 종료
        post({ type: "MOVE_CAMERA", lat: 37.5665, lng: 126.978, zoom: 12 });
        setLoading(false);
      }

      // 위치 업데이트 확인
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 3000,
          distanceInterval: 5,
          mayShowUserSettingsDialog: true,
        },
        (loc) => {
          post({
            type: "SET_CURRENT",
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            accuracy: loc.coords.accuracy,
            follow: false,
          });
          // 이미 꺼졌을 가능성이 높지만 안전하게 한 번 더
          if (loading) setLoading(false);
        }
      );
    })();

    return () => {
      mounted = false;
      watcherRef.current?.remove();
      watcherRef.current = null;
      clearTimeout(slowTimer); //타이머 정리
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
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
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

        {/*로딩 오버레이 */}
        {loading && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" />
            <Text style={styles.title}>현재 위치 찾는 중…</Text>
            <Text style={styles.sub}>
              {isSlow
                ? "GPS가 조금 느리네요. 잠시만요!"
                : "위치 정보 가져오는 중"}
            </Text>
            {isSlow && (
              <Pressable style={styles.btn} onPress={() => setLoading(false)}>
                <Text style={styles.btnText}>그냥 지도부터 볼래</Text>
              </Pressable>
            )}
          </View>
        )}

        {/*바텀시트*/}
        <BottomSheet
          ref={sheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={false}
          style={{ zIndex: 50, elevation: 50 }}
          backgroundStyle={{
            backgroundColor: "#1A1A1C",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}
          handleIndicatorStyle={{ backgroundColor: "#ffffff80" }}
        >
          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 15,
            }}
            // scroll 시 시트 안에서만 스크롤되게
            showsVerticalScrollIndicator={false}
          >
            <View className="w-full flex-row justify-center">
              {cats.map((c) => (
                <Pressable
                  key={c.key}
                  className="bg-[#2E2E31] w-[30%] mx-2 p-3 rounded-3xl justify-center"
                  onPress={() => {
                    // TODO: 카테고리 클릭 액션
                  }}
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
                //바텀 내려두고
                sheetRef.current?.snapToIndex?.(0);
                // Onboarding 화면으로 이동
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
