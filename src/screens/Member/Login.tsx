import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import Header from "../../components/Header";
import { Switch } from 'react-native-switch';
import { useNavigation } from '@react-navigation/native';

export default function Login() {
  const [isEnabled, setIsEnabled] = useState(false);
  const navigation = useNavigation();
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <View className="h-full bg-[#101010]">
      <Header title=" " />
      <View className="flex-1 pt-3 m-8">
        <Text className="text-white text-[22px] font-bold mb-6">
          로그인
        </Text>

        <View>
          <TextInput
            className="bg-[#FFFFFF] px-3 py-3.5 rounded-md mb-5"
            autoCapitalize="none"
            placeholder="아이디"
            placeholderTextColor="#B3B3B3"
          />

          <TextInput
            className="bg-[#FFFFFF] px-3 py-3.5 rounded-md mb-5"
            autoCapitalize="none"
            placeholder="비밀번호"
            placeholderTextColor="#B3B3B3"
            secureTextEntry
          />

          <View className="flex-row items-center justify-end mb-5">
            <Text className="text-[#FFFFFF] text-[11px] mr-2">
              로그인 상태유지
            </Text>
            <Switch
              value={isEnabled}
              onValueChange={toggleSwitch}
              disabled={false}
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
              innerCircleStyle={{
                alignItems: 'center',
                justifyContent: 'center',
              }}
              renderActiveText={false}
              renderInActiveText={false}
              switchLeftPx={1.9}
              switchRightPx={1.9}
              switchWidthMultiplier={2.8}
              switchBorderRadius={15}
            />
          </View>

          <TouchableOpacity className="items-center py-4 bg-[#E9690D] rounded-md mb-10">
            <Text className="font-bold text-white">로그인</Text>
          </TouchableOpacity>

          <View className="flex flex-row items-center justify-center mb-20">
            <TouchableOpacity className="items-center">
              <Text className="font-medium text-[10.5px] text-white">로그인</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <Text className="font-medium text-[10.5px] text-white mx-9">비밀번호 찾기</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Nickname')}>
              <Text className="font-medium text-[10.5px] text-white">회원가입</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-14">
            <View className="flex-1 h-[0.5px] bg-white" />
            <Text className="mx-6 text-white text-[12px]">OR</Text>
            <View className="flex-1 h-[0.5px] bg-white" />
          </View>
        </View>

        <View className="flex items-center mb-5">
            <Text className="text-white text-[12px]">SNS 계정으로 로그인</Text>
        </View>

        <View className="flex flex-row justify-center">
          <Image
            source={require("../../../assets/images/Social/kakao.png")}
            className="w-11 h-11"
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/images/Social/naver.png")}
            className="mx-4 w-11 h-11"
            resizeMode="contain"
          />
          <Image
            source={require("../../../assets/images/Social/google.png")}
            className="w-11 h-11"
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
