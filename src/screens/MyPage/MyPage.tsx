import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ProfileAvatarRing from "./ProfileAvaterRing";

const ITEMS = [
  { key: "card", label: "결제 카드 등록" },
  { key: "points", label: "포인트 내역" },
  { key: "profile", label: "프로필 변경" },
  { key: "privacy", label: "개인정보 동의" },
  { key: "settings", label: "설정" },
];

export default function MyPage() {
  const handlePress = (key: string) => {
    console.log("pressed:", key);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#101010]">
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-5 pt-16 pb-4">
          <Text className="text-white text-3xl font-semibold text-center">
            MY PAGE
          </Text>
        </View>

        <View className="items-center pt-4 mb-10">
          <ProfileAvatarRing
            uri={require("../../../assets/images/profile.png")}
            size={96}
            strokeWidth={4}
            arcRatio={0.74}
            ringColor="#F38C1A"
            startAtTop
          />

          <Text className="text-white text-xl font-extrabold mt-6">
            신민서님
          </Text>
        </View>

        <View
          className="mt-6 h-full bg-white">
          {ITEMS.map((item, idx) => (
            <Pressable
              key={item.key}
              onPress={() => handlePress(item.key)}
              className="flex-row items-center justify-between px-7 h-[77px]"
              android_ripple={{ color: "#0000000D" }}
            >
              <Text className="text-[#191919] text-[15px] font-bold">{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color="#9EA3AE" />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* 하단 탭은 프로젝트에 이미 있을 테니 여기선 X (Bar 컴포넌트로 관리) */}
    </SafeAreaView>
  );
}
