import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import Header from "../../components/Header";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../../../App"; // App.tsx에서 타입 import
import axios from "axios";
import Constants from "expo-constants";

type NavigationProp = BottomTabNavigationProp<RootTabParamList>;

export default function Signup() {
  const navigation = useNavigation<NavigationProp>();
  const API_URL =
    Constants?.expoConfig?.extra?.apiUrl ?? "https://movingcash.sku-sku.com";

  // 닉네임, 아이디, 비밀번호 상태
  const [nickname, setNickname] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [isCheckedPw, setIsCheckedPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const idInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  // 비밀번호 일치 여부 확인
  useEffect(() => {
    if (password && passwordConfirm && password === passwordConfirm) {
      setIsCheckedPw(true);
    } else {
      setIsCheckedPw(false);
    }
  }, [password, passwordConfirm]);

  // 회원가입 실행
  const handleSignup = async () => {
    if (!nickname.trim()) return Alert.alert("닉네임을 입력해주세요.");
    if (!id.trim()) return Alert.alert("아이디를 입력해주세요.");
    if (!isCheckedPw) return Alert.alert("비밀번호를 확인해주세요.");

    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name: nickname,
        userId: id,
        password: password,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert("회원가입 성공!", "로그인 화면으로 이동합니다.", [
          { text: "확인", onPress: () => navigation.navigate("Login") },
        ]);
      } else {
        Alert.alert("회원가입 실패", "다시 시도해주세요.");
      }
    } catch (error: any) {
      console.error(error);

      if (error.response?.status === 409) {
        Alert.alert("회원가입 실패", "이미 존재하는 아이디입니다.");
      } else {
        Alert.alert("회원가입 실패", "다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="h-full bg-[#101010]">
      <Header title="회원가입" />
      <View className="justify-between flex-1 pt-3 m-8">
        <View>
          <Text className="text-white text-[18px] font-bold mb-8">
            회원가입 정보를 입력해 주세요.
          </Text>

          {/* 닉네임 */}
          <View className="mx-1 mb-6">
            <Text className="text-[#FFFFFF] text-[12px] mb-3">닉네임 *</Text>
            <TextInput
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임"
              placeholderTextColor="#B3B3B3"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => idInputRef.current?.focus()}
              className={`w-full px-3 py-2.5 bg-[#101010] text-[#FFFFFF] rounded-md ${
                nickname ? "border border-[#FFFFFF]" : "border border-[#818181]"
              }`}
            />
          </View>

          {/* 아이디 */}
          <View className="mx-1 mb-6">
            <Text className="text-[#FFFFFF] text-[12px] mb-3">아이디 *</Text>
            <TextInput
              ref={idInputRef}
              value={id}
              onChangeText={setId}
              placeholder="아이디"
              placeholderTextColor="#B3B3B3"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              className={`w-full px-3 py-2.5 bg-[#101010] text-[#FFFFFF] rounded-md ${
                id ? "border border-[#FFFFFF]" : "border border-[#818181]"
              }`}
            />
          </View>

          {/* 비밀번호 */}
          <View className="mx-1 mb-6">
            <Text className="text-[#FFFFFF] text-[12px] mb-3">비밀번호 *</Text>
            <TextInput
              ref={passwordInputRef}
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor="#B3B3B3"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => passwordConfirmRef.current?.focus()}
              className={`w-full px-3 py-2.5 text-[#FFFFFF] rounded-md mb-3 bg-[#101010] ${
                password ? "border border-[#FFFFFF]" : "border border-[#818181]"
              }`}
            />

            <TextInput
              ref={passwordConfirmRef}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호 확인"
              placeholderTextColor="#B3B3B3"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
              className={`w-full px-3 py-2.5 text-[#FFFFFF] rounded-md mb-2 bg-[#101010] ${
                passwordConfirm
                  ? "border border-[#FFFFFF]"
                  : "border border-[#818181]"
              }`}
            />

            {password && passwordConfirm && !isCheckedPw && (
              <Text className="mt-1 text-[11px] text-[#FF4444]">
                비밀번호가 일치하지 않습니다.
              </Text>
            )}
            {isCheckedPw && (
              <Text className="mt-1 text-[11px] text-[#E9690D]">
                비밀번호가 일치합니다.
              </Text>
            )}
          </View>
        </View>

        {/* 완료 버튼 */}
        <TouchableOpacity
          className={`flex justify-center items-center py-3 rounded-3xl ${
            nickname && id && isCheckedPw && !isLoading
              ? "bg-[#E9690D]"
              : "bg-[#222222]"
          }`}
          disabled={!nickname || !id || !isCheckedPw || isLoading}
          onPress={handleSignup}
        >
          <Text
            className={`font-bold ${
              nickname && id && isCheckedPw && !isLoading
                ? "text-white"
                : "text-[#A1A1A1]"
            }`}
          >
            {isLoading ? "처리중..." : "회원가입"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
