import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import Header from "src/components/Header";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MainStackParamList } from "App";

function Chip({
  label,
  emoji,
  selected,
  onPress,
}: {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={[
        "px-4 py-2 mr-2 mb-2 rounded-full border flex-row items-center",
        selected
          ? "bg-[#FFFFFF] border-[#FF6B00]"
          : "bg-[#313131] border-[#848484]",
      ].join(" ")}
    >
      {!!emoji && <Text className="mr-1">{emoji}</Text>}
      <Text className={selected ? "text-black" : "text-white"}>{label}</Text>
    </Pressable>
  );
}
//위는 테마 선택 버튼

export default function Onboarding() {
  const navigation =
    useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  // 3단계
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 선택 데이터
  const [form, setForm] = useState<{
    themes: Set<string>; // step1 다중선택
    difficulty: Set<string>; // step2 다중선택
    prefs: Set<string>; // step3 다중선택
  }>({
    themes: new Set(),
    difficulty: new Set(),
    prefs: new Set(),
  });

  // 진행 바
  const progress = useMemo(() => (step / 3) * 100, [step]);

  // ----- Step 1: 오늘의 산책 테마 -----
  const STEP1_OPTIONS: { label: string; emoji?: string }[] = [
    { label: "활력 충전", emoji: "💪" },
    { label: "반려동물 동반", emoji: "🐾" },
    { label: "경치 좋은 코스", emoji: "🌄" },
    { label: "하천 또는 강", emoji: "🏞️" },
    { label: "가벼운 산책", emoji: "🚶" },
    { label: "밤에도 안전한 길", emoji: "🌙" },
    { label: "카페 들르는 길", emoji: "☕" },
    { label: "쇼핑·상권 코스", emoji: "🛍️" },
    { label: "휴식·벤치 많은 길", emoji: "🪑" },
  ];

  // ----- Step 2: 난이도/시간 -----
  const STEP2_OPTIONS: { label: string; emoji?: string }[] = [
    { label: "쉬움", emoji: "🍃" },
    { label: "중간", emoji: "🧭" },
    { label: "어려움", emoji: "⛰️" },
    { label: "여유롭게", emoji: "😌" },
    { label: "보통", emoji: "🚶‍♂️" },
    { label: "땀나는", emoji: "🔥" },
    { label: "짧게 15~20분", emoji: "⚡" },
    { label: "중간 30~50분", emoji: "⏱️" },
    { label: "길게 1시간+", emoji: "⏳" },
  ];

  // ----- Step 3: 추가 취향 옵션 -----
  const STEP3_OPTIONS: { label: string; emoji?: string }[] = [
    { label: "편의시설", emoji: "🚻" },
    { label: "우천 대비", emoji: "☔" },
    { label: "오전 햇살", emoji: "🌤️" },
    { label: "오후 노을", emoji: "🌇" },
    { label: "야경", emoji: "🌃" },
    { label: "인기 코스", emoji: "🌟" },
    { label: "차도와 분리", emoji: "🚸" },
    { label: "가족 동반", emoji: "👨‍👩‍👧" },
    { label: "데이트", emoji: "💛" },
    { label: "인터벌 구간", emoji: "🏁" },
    { label: "페이스 조절 구간", emoji: "🎯" },
  ];

  // 유효성 체크
  const canGoNext = useMemo(() => {
    if (step === 1) return form.themes.size > 0;
    if (step === 2) return form.difficulty.size > 0;
    return true;
  }, [step, form]);

  const pickWithEmoji = (labels: Set<string>, options: {label:string; emoji?:string}[]) =>
  options.filter(o => labels.has(o.label)); 

  // 제출
  const handleSubmit = async () => {
  const payloadForApi = {
    themes: Array.from(form.themes),
    difficulty: Array.from(form.difficulty),
    prefs: Array.from(form.prefs),
  };
  // TODO: API 호출 시엔 payloadForApi 쓰면 됨
  const params = {
    themes: pickWithEmoji(form.themes, STEP1_OPTIONS),
    difficulty: pickWithEmoji(form.difficulty, STEP2_OPTIONS),
    prefs: pickWithEmoji(form.prefs, STEP3_OPTIONS),
  };
  navigation.navigate("MovingSpotResult", params);
};

  return (
    <View className="flex-1 bg-[#101010] w-full">
      <Header title="무빙과 함께 걷는 ai 추천 산책 코스" />

      {/* 진행 바 */}
      <View className="w-full px-5 mt-3">
        <View className="w-full h-[6px] rounded-full bg-[#5B5B5B]" />
        <View
          className="h-[6px] rounded-full bg-[#FFFFFF] -mt-[6px]"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* 본문 */}
      <View className="items-center mt-7 flex-1">
        <View className="w-[85%]">
          {step === 1 && (
            <>
              <Text className="text-white text-xl font-bold">
                오늘의 산책 테마를
              </Text>
              <Text className="text-white text-xl font-bold mb-4">
                선택해 주세요!
              </Text>

              <View className="flex-row flex-wrap mt-5">
                {STEP1_OPTIONS.map((o) => {
                  const selected = form.themes.has(o.label);
                  return (
                    <Chip
                      key={o.label}
                      emoji={o.emoji}
                      label={o.label}
                      selected={selected}
                      onPress={() => {
                        const next = new Set(form.themes);
                        selected ? next.delete(o.label) : next.add(o.label);
                        setForm((f) => ({ ...f, themes: next }));
                      }}
                    />
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <>
              <Text className="text-white text-xl font-bold mb-3">
                어떤 난이도를 원하세요?
              </Text>
              <View className="flex-row flex-wrap">
                {STEP2_OPTIONS.map((o) => {
                  const selected = form.difficulty.has(o.label); 
                  return (
                    <Chip
                      key={o.label}
                      emoji={o.emoji}
                      label={o.label}
                      selected={selected}
                      onPress={() => {
                        const next = new Set(form.difficulty); 
                        selected ? next.delete(o.label) : next.add(o.label);
                        setForm((f) => ({ ...f, difficulty: next }));
                      }}
                    />
                  );
                })}
              </View>
            </>
          )}

          {step === 3 && (
            <>
              <Text className="text-white text-xl font-bold mb-4">
                최고의 운동을 위해 맞춰드릴게요!
              </Text>
              <View className="flex-row flex-wrap mt-1">
                {STEP3_OPTIONS.map((o) => {
                  const selected = form.prefs.has(o.label);
                  return (
                    <Chip
                      key={o.label}
                      emoji={o.emoji}
                      label={o.label}
                      selected={selected}
                      onPress={() => {
                        const next = new Set(form.prefs);
                        selected ? next.delete(o.label) : next.add(o.label);
                        setForm((f) => ({ ...f, prefs: next }));
                      }}
                    />
                  );
                })}
              </View>
            </>
          )}
        </View>
      </View>

      {/* 하단 버튼 */}
      <View className="px-5 pb-6 w-full items-center">
        <Text className="text-[#939393] mb-4 text-xs">
          모든 선택은 나중에 다시 수정할 수 있어요!
        </Text>
        <View className="flex-row justify-evenly w-full">
          <Pressable
            className="w-[40%] h-12 rounded-3xl mr-2 bg-white items-center justify-center"
            onPress={() => {
              if (step === 1) navigation.goBack();
              else setStep((s) => (s - 1) as 1 | 2 | 3);
            }}
          >
            <Text className="text-[#101010] font-bold">
              {step === 1 ? "이전" : "이전"}
            </Text>
          </Pressable>

          <Pressable
            className={[
              "w-[40%] h-12 rounded-3xl items-center justify-center",
              canGoNext ? "bg-[#FF6B00]" : "bg-[#FF6B00]/40",
            ].join(" ")}
            disabled={!canGoNext}
            onPress={() => {
              if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
              else handleSubmit();
            }}
          >
            <Text className="text-white font-bold">
              {step < 3 ? "다음" : "완료"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
