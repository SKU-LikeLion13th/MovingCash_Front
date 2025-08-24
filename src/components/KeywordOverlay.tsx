import React, { useEffect, useRef, useState } from "react";
import { View, Pressable, TextInput, Text } from "react-native";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (keyword: string) => void;
  initial?: string;
};

export default function KeywordOverlay({ open, onClose, onSubmit, initial = "" }: Props) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (open) {
      setValue(initial);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <View className="absolute top-[200px] right-11 z-50">
      <Pressable
        className="absolute inset-0 bg-black/60"
        onPress={onClose}
      />

      {/* Card */}
      <View className="flex-1 items-center justify-center px-5 w-[320px]">
        <View className="w-full rounded-2xl bg-[#1A1A1C] p-4 shadow-lg"
              style={{ elevation: 10 }}>
          <Text className="text-white text-base font-extrabold mb-3">
            어디 가고 싶어? 키워드 입력!
          </Text>

          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            placeholder="예: 보드게임, 전시, 노래방..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="search"
            onSubmitEditing={() => {
              onClose();
              onSubmit(value.trim() || "놀거리");
            }}
            className="text-white bg-[#2E2E31] rounded-xl px-3 py-2"
          />

          <View className="flex-row gap-2 mt-3">
            <Pressable
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-xl bg-[#2E2E31] py-2"
            >
              <Text className="text-white font-bold">취소</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                onClose();
                onSubmit(value.trim() || "놀거리");
              }}
              className="flex-1 items-center justify-center rounded-xl bg-[#F38C1A] py-2"
            >
              <Text className="text-[#111111] font-extrabold">검색</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}
