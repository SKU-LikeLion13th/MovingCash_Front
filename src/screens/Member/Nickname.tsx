import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";

export default function Nickname() {
  const [nickname, setNickname] = useState("");
  const navigation = useNavigation();
  const [isChecked, setIsChecked] = useState(false); // 중복확인 완료 여부

  const handleCheck = () => {
    if (nickname.trim()) {
      setIsChecked(true);
      Keyboard.dismiss(); // 키보드 닫기
    }
  };

  const handleNext = () => {
    if (isChecked) {
      navigation.navigate("Id", { nickname });
    }
  };

  return (
    <View className="h-full bg-[#101010]">
      <Header title=" " />
      <View className="justify-between flex-1 pt-3 m-8">
        <View>
          <Text className="text-white text-[18px] font-bold mb-8">
            사용하실 닉네임을 입력해 주세요.
          </Text>

          <View className="mx-1">
            <Text className="text-[#FFFFFF] text-[12px] mb-3">닉네임 *</Text>
            <View className="flex flex-row items-center justify-between mb-2">
              <TextInput
                value={nickname}
                onChangeText={(text) => {
                  setNickname(text);
                  setIsChecked(false); // 입력 변경 시 중복확인 초기화
                }}
                autoCapitalize="none" // 첫 글자 자동 대문자 방지
                returnKeyType={isChecked ? "next" : "done"} // 엔터 키 표시 변경
                onSubmitEditing={() => {
                  if (!isChecked) {
                    handleCheck();
                  } else {
                    handleNext();
                  }
                }}
                className={`flex w-[64%] px-3 py-2.5 bg-[#101010] text-[#FFFFFF] rounded-md ${
                  nickname ? "border border-[#FFFFFF]" : "border border-[#818181]"
                }`}
              />
              <TouchableOpacity
                className={`flex px-8 py-3 rounded-md items-center justify-center ${
                  nickname ? "bg-[#E9690D]" : "bg-[#B3B3B3]"
                }`}
                disabled={!nickname}
                onPress={handleCheck}
              >
                <Text
                  className={`font-bold text-[11px] ${
                    nickname ? "text-white" : "text-[#D7D7D7]"
                  }`}
                >
                  중복확인
                </Text>
              </TouchableOpacity>
            </View>

            {isChecked && (
              <Text className="mt-1 text-[11px] text-[#E9690D]">
                사용 가능한 닉네임입니다.
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          className={`flex justify-center items-center py-3 rounded-3xl ${
            isChecked ? "bg-[#E9690D]" : "bg-[#222222]"
          }`}
          disabled={!isChecked}
          onPress={handleNext}
        >
          <Text
            className={`font-bold ${isChecked ? "text-white" : "text-[#A1A1A1]"}`}
          >
            다음
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
