import { View, Text, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

export default function Profile() {
  const imageSize = 60; // 이미지 크기
  const strokeWidth = 4; // 테두리 두께
  const ringSize = imageSize + strokeWidth * 2; // 이미지보다 조금 크게
  const radius = ringSize / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.7; // 70% 진행

  const [name, setName] = useState<string>("User");

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
          return;
        }

        const response = await fetch(
          "http://movingcash.sku-sku.com/sessions/getPointAndStep",
          {
            method: "GET",
            headers: {
              Authorization: token,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(
            "API 호출 실패:",
            response.status,
            await response.text()
          );
          return;
        }

        const data = await response.json();
        setName(data.name);
      } catch (error) {
        console.error("API 호출 실패:", error);
      }
    };

    fetchUserName();
  }, []);

  return (
    <View className="flex flex-row items-center">
      {/* 이미지 */}
      <View style={{ position: "relative", width: ringSize, height: ringSize }}>
        {/* SVG 테두리 */}
        <Svg
          height={ringSize}
          width={ringSize}
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          <Circle
            stroke="#FF5722"
            fill="none"
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            rotation="0"
            origin={`${ringSize / 2}, ${ringSize / 2}`}
          />
        </Svg>

        {/* 이미지 */}
        <Image
          source={require("../../../assets/images/profile.png")}
          className="rounded-full"
          style={{
            width: imageSize,
            height: imageSize,
            position: "absolute",
            top: strokeWidth,
            left: strokeWidth,
          }}
        />
      </View>
      {/* 이름 */}
      <View className="ml-3 flex-1">
        <View className="flex flex-row justify-between">
          <Text className="text-white text-[24px] font-bold">{name}님</Text>
          <SimpleLineIcons name="bell" size={24} color="white" />
        </View>

        <Text className="text-white text-[12px] mt-1 text-[#C3C3C3]">
          운동하기 좋은 오후예요! 가볍게 뛰어볼까요?
        </Text>
      </View>
    </View>
  );
}
