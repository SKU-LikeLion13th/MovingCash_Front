// src/screens/MyPage/MyPage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileAvatarRing from "./ProfileAvaterRing"; // 경로는 프로젝트에 맞춰 조정!
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ITEMS = [
  { key: "card", label: "결제 카드 등록" },
  { key: "points", label: "포인트 내역" },
  { key: "profile", label: "프로필 변경" },
  { key: "privacy", label: "개인정보 동의" },
  { key: "settings", label: "설정" },
];

type MeResponse = {
  name: string;
  point: number;
  step: number;
};

export default function MyPage() {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handlePress = (key: string) => {
    console.log("pressed:", key);
  };

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          setName(null);
          return;
        }
        const res = await axios.get<MeResponse>(
          "http://movingcash.sku-sku.com/sessions/getPointAndStep",
          { headers: { Authorization: token } }
        );
        //name만 사용
        setName(res.data?.name ?? null);
      } catch (err) {
        console.warn("유저 정보 불러오기 실패:", err);
        setName(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#101010]">
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* 헤더 */}
        <View className="px-5 pt-16 pb-4">
          <Text className="text-white text-3xl font-semibold text-center">
            MY PAGE
          </Text>
        </View>

        {/* 아바타 + 이름 */}
        <View className="items-center pt-4 mb-10">
          <ProfileAvatarRing
            uri={require("../../../assets/images/profile.png")}
            size={96}
            strokeWidth={4}
            arcRatio={0.74}
            ringColor="#F38C1A"
            startAtTop
          />

          <View className="mt-6 items-center justify-center">
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text className="text-white text-xl font-extrabold">
                {(name ?? "사용자") + "님"}
              </Text>
            )}
          </View>
        </View>

        {/* 메뉴 리스트 */}
        <View className="mt-6 bg-white">
          {ITEMS.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => handlePress(item.key)}
              className="flex-row items-center justify-between px-7 h-[77px]"
              android_ripple={{ color: "#0000000D" }}
            >
              <Text className="text-[#191919] text-[15px] font-bold">
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9EA3AE" />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
