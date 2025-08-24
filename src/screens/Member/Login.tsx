import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Header";
import { Switch } from "react-native-switch";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [isEnabled, setIsEnabled] = useState(false);
  const navigation = useNavigation();
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // 로그인 진행 여부

  const handleLogin = async () => {
    if (loading) return; // 이미 진행 중이면 무시
    setLoading(true);

    Keyboard.dismiss();
    try {
      const response = await axios.post(
        "http://movingcash.sku-sku.com/auth/login",
        {
          userId: id,
          password: password,
        }
      );

      if (response.status === 200) {
        const { token, tokenType } = response.data;

        if (!token || !tokenType) {
          Alert.alert("로그인 실패", "토큰 정보를 받아오지 못했습니다.");
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem("accessToken", `${tokenType} ${token}`);
        Alert.alert("로그인 성공", "환영합니다!");
        navigation.navigate("MainTab", { screen: "Main" });
      }
    } catch (error) {
      console.error("로그인 실패:", error);
      Alert.alert("로그인 실패", "아이디/비밀번호를 확인해주세요.");
    } finally {
      setLoading(false); // 무조건 해제
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#101010" }}>
      <Header title=" " />
      <View style={{ flex: 1, paddingTop: 12, margin: 32 }}>
        <Text
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 24,
          }}
        >
          로그인
        </Text>

        {/* 아이디 입력 */}
        <TextInput
          style={{
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 12,
            paddingVertical: 14,
            borderRadius: 6,
            marginBottom: 20,
          }}
          autoCapitalize="none"
          placeholder="아이디"
          placeholderTextColor="#B3B3B3"
          value={id}
          onChangeText={setId}
          returnKeyType="next"
          onSubmitEditing={() => {
            Keyboard.dismiss();
          }}
        />

        {/* 비밀번호 입력 */}
        <TextInput
          style={{
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 12,
            paddingVertical: 14,
            borderRadius: 6,
            marginBottom: 20,
          }}
          autoCapitalize="none"
          placeholder="비밀번호"
          placeholderTextColor="#B3B3B3"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />

        {/* 로그인 상태 유지 */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            marginBottom: 20,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 11, marginRight: 8 }}>
            로그인 상태유지
          </Text>
          <Switch
            value={isEnabled}
            onValueChange={toggleSwitch}
            activeText=""
            inActiveText=""
            circleSize={14}
            barHeight={17}
            circleBorderWidth={0}
            backgroundActive="#E9690D"
            backgroundInactive="#D9D9D9"
            circleActiveColor="#FFFFFF"
            circleInActiveColor="#8A8A8A"
            changeValueImmediately={true}
            renderActiveText={false}
            renderInActiveText={false}
            switchLeftPx={1.9}
            switchRightPx={1.9}
            switchWidthMultiplier={2.8}
            switchBorderRadius={15}
          />
        </View>

        {/* 로그인 버튼 */}
        <TouchableOpacity
          style={{
            alignItems: "center",
            paddingVertical: 16,
            backgroundColor: loading ? "#888888" : "#E9690D", // 로딩 시 회색
            borderRadius: 6,
            marginBottom: 40,
          }}
          onPress={handleLogin}
          disabled={loading} // 로딩 중에는 비활성화
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ fontWeight: "bold", color: "white" }}>로그인</Text>
          )}
        </TouchableOpacity>

        {/* 회원 관련 */}
        <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 40 }}>
          <TouchableOpacity>
            <Text style={{ fontSize: 10.5, fontWeight: "500", color: "white" }}>
              로그인
            </Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={{ fontSize: 10.5, fontWeight: "500", color: "white", marginHorizontal: 36 }}>
              비밀번호 찾기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
            <Text style={{ fontSize: 10.5, fontWeight: "500", color: "white" }}>
              회원가입
            </Text>
          </TouchableOpacity>
        </View>

        {/* OR 구분선 */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 36 }}>
          <View style={{ flex: 1, height: 0.5, backgroundColor: "white" }} />
          <Text style={{ marginHorizontal: 24, color: "white", fontSize: 12 }}>OR</Text>
          <View style={{ flex: 1, height: 0.5, backgroundColor: "white" }} />
        </View>

        {/* SNS 로그인 */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Text style={{ color: "white", fontSize: 12 }}>SNS 계정으로 로그인</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center" }}>
          <Image
            source={require("../../../assets/images/Social/kakao.png")}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/images/Social/naver.png")}
            style={{ width: 44, height: 44, marginHorizontal: 16 }}
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/images/Social/google.png")}
            style={{ width: 44, height: 44 }}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
