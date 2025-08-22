import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from "../../components/Header";
import axios from "axios";

export default function Pw() {
  const navigation = useNavigation();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const { nickname, id } = route.params as { nickname: string; id: string };

  // ✅ ref 추가해서 엔터 입력 시 다음 input 포커스 가능
  const passwordConfirmRef = useRef<TextInput>(null);

  useEffect(() => {
    if (password && passwordConfirm && password === passwordConfirm) {
      setIsChecked(true);
    } else {
      setIsChecked(false);
    }
  }, [password, passwordConfirm]);

  const handleSignup = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await axios.post("http://movingcash.sku-sku.com/auth/signup", {
        name: nickname,
        userId: id,
        password: password,
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert(
          "회원가입 성공!",
          "로그인 화면으로 이동합니다.",
          [{ text: "확인", onPress: () => navigation.navigate("Login") }]
        );
      } else {
        Alert.alert("회원가입 실패", "다시 시도해주세요.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("회원가입 실패", "다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#101010" }}>
      <Header title=" " />
      <View style={{ flex: 1, justifyContent: "space-between", paddingTop: 12, margin: 32 }}>
        <View>
          <Text style={{ color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 32 }}>
            비밀번호를 입력해 주세요.
          </Text>

          <View style={{ marginHorizontal: 4 }}>
            <Text style={{ color: "#FFFFFF", fontSize: 12, marginBottom: 12 }}>비밀번호 *</Text>
            <View style={{ alignItems: "center", marginBottom: 8 }}>
              {/* 비밀번호 입력 */}
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="비밀번호"
                placeholderTextColor="#B3B3B3"
                style={{
                  width: "100%",
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: "#101010",
                  color: "#FFFFFF",
                  fontSize: 12,
                  borderRadius: 6,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: password ? "#FFFFFF" : "#818181",
                }}
                secureTextEntry
                autoCapitalize="none"    // ✅ 대문자 자동 변환 방지
                autoCorrect={false}      // ✅ 자동 수정 방지
                returnKeyType="next"     // ✅ 엔터키 → 다음
                onSubmitEditing={() => passwordConfirmRef.current?.focus()}
              />

              {/* 비밀번호 확인 입력 */}
              <TextInput
                ref={passwordConfirmRef}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                placeholder="비밀번호 확인"
                placeholderTextColor="#B3B3B3"
                style={{
                  width: "100%",
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: "#101010",
                  color: "#FFFFFF",
                  fontSize: 12,
                  borderRadius: 6,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: passwordConfirm ? "#FFFFFF" : "#818181",
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"     // ✅ 마지막은 완료
                onSubmitEditing={handleSignup} // ✅ 엔터 → 회원가입 실행
              />

              <View style={{ alignItems: "flex-start", width: "100%" }}>
                <Text style={{ color: "#ACACAC", fontSize: 9 }}>
                  6~20자/영문 대문자, 소문자, 숫자, 특수문자 중 2가지 이상 조합
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 완료 버튼 */}
        <TouchableOpacity
          style={{
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 12,
            borderRadius: 24,
            backgroundColor: isChecked && !isLoading ? "#E9690D" : "#222222",
          }}
          disabled={!isChecked || isLoading}
          onPress={handleSignup}
        >
          <Text
            style={{
              fontWeight: "bold",
              color: isChecked && !isLoading ? "white" : "#A1A1A1",
            }}
          >
            {isLoading ? "처리중..." : isChecked ? "완료" : "다음"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
