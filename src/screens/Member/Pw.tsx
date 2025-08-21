import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from "../../components/Header";
import axios from "axios";

export default function Pw() {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const route = useRoute();
  const { nickname, id } = route.params as { nickname: string; id: string };

  // 두 비밀번호가 같을 때 isChecked true
  useEffect(() => {
    if (password && passwordConfirm && password === passwordConfirm) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [password, passwordConfirm]);

  const handleSignup = async () => {
    try {
      const response = await axios.post("http://movingcash.sku-sku.com/auth/signup", {
        name: nickname,
        userId: id,
        password: password,
      });

      if (response.status === 200) {
        Alert.alert("회원가입 성공!", "로그인 화면으로 이동합니다.");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("회원가입 실패", "다시 시도해주세요.");
    }
  };

  return (
    <View className="h-full bg-[#101010]">
      <Header title=" " />
      <View className="justify-between flex-1 pt-3 m-8">
        <View>
          <Text className="text-white text-[18px] font-bold mb-8">
            비밀번호를 입력해 주세요.
          </Text>

          <View className="mx-1">
            <Text className="text-[#FFFFFF] text-[12px] mb-3">비밀번호  *</Text>
            <View className="flex items-center mb-2">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor="#B3B3B3"
                className={`flex w-full px-3 py-3 bg-[#101010] text-[#FFFFFF] text-[11.5px] rounded-md mb-3.5 ${
                  password ? "border border-[#FFFFFF]" : "border border-[#818181]"
                }`}
                secureTextEntry
              />

              <TextInput
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="비밀번호 확인"
                placeholderTextColor="#B3B3B3"
                className={`flex w-full px-3 py-3 bg-[#101010] text-[#FFFFFF] text-[11.5px] rounded-md mb-4 ${
                  passwordConfirm ? "border border-[#FFFFFF]" : "border border-[#818181]"
                }`}
                secureTextEntry
              />

              <View className="flex items-start w-full">
                <Text className="text-[#ACACAC] text-[9px]">
                  6~20자/영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
                </Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className={`flex justify-center items-center py-3 rounded-3xl ${
            isChecked ? "bg-[#E9690D]" : "bg-[#222222]"
          }`}
          disabled={!isChecked}
          onPress={handleSignup}
        >
          <Text
            className={`font-bold ${isChecked ? "text-white" : "text-[#A1A1A1]"}`}
          >
            {isChecked ? "완료" : "다음"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
