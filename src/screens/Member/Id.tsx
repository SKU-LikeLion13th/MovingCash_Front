import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Keyboard } from "react-native";
import Header from "../../components/Header";
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Id() {
  const [id, setId] = useState("");
  const navigation = useNavigation();
  const [isChecked, setIsChecked] = useState(false);
  const route = useRoute();
  const { nickname } = route.params as { nickname: string };

  const handleCheck = () => {
    if (!id) return;
    setIsChecked(true);
    Keyboard.dismiss();
  };

  const handleNext = () => {
    if (!isChecked) return;
    navigation.navigate("Pw", { nickname, id });
  };

  return (
    <View className="h-full bg-[#101010]">
      <Header title=" " />
      <View className="justify-between flex-1 pt-3 m-8">
        <View>
          <Text className="text-white text-[18px] font-bold mb-8">
            아이디를 입력해 주세요.
          </Text>

          <View className="mx-1">
            <Text className="text-[#FFFFFF] text-[12px] mb-3">아이디 *</Text>
            <View className="flex flex-row items-center justify-between mb-2">
              <TextInput
                value={id}
                onChangeText={(text) => {
                  setId(text);
                  setIsChecked(false);
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType={isChecked ? "done" : "next"}
                onSubmitEditing={() => {
                  if (!isChecked) {
                    handleCheck();
                  } else {
                    handleNext();
                  }
                }}
                className={`flex w-[64%] px-3 py-2.5 bg-[#101010] text-[#FFFFFF] rounded-md ${
                  id ? "border border-[#FFFFFF]" : "border border-[#818181]"
                }`}
              />

              <TouchableOpacity
                className={`flex px-8 py-3 rounded-md items-center justify-center ${
                  id ? "bg-[#E9690D]" : "bg-[#B3B3B3]"
                }`}
                disabled={!id}
                onPress={handleCheck}
              >
                <Text
                  className={`font-bold text-[11px] ${
                    id ? "text-white" : "text-[#D7D7D7]"
                  }`}
                >
                  중복확인
                </Text>
              </TouchableOpacity>
            </View>

            {isChecked && (
              <Text className="mt-1 text-[11px] text-[#E9690D]">
                사용 가능한 아이디입니다.
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
