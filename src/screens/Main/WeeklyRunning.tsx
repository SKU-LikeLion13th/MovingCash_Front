import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function WeeklyRunning() {
  const [days, setDays] = useState<number[]>([]); // 0=참여X, 1=참여, 2=오늘
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    const fetchWeeklyData = async () => {
      try {
        // AsyncStorage에서 토큰 가져오기
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          console.warn("토큰이 없습니다. 로그인 필요!");
          return;
        }

        const today = new Date();
        const todayStr = today.toISOString().split("T")[0] + "T00:00:00";

        // 이번 주 월요일 ~ 일요일 구하기
        const dayOfWeek = today.getDay(); // 0=일 ~ 6=토
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // 월요일로 이동
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);

        // API 요청
        const response = await axios.post(
          "http://movingcash.sku-sku.com/mainPage",
          {
            status: "RUNNING",
            startDate: monday.toISOString().split("T")[0] + "T00:00:00",
            endDate: sunday.toISOString().split("T")[0] + "T00:00:00",
            todayDate: todayStr,
          },
          {
            headers: {
              Authorization: `${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // 서버에서 받은 activateList 확인
        const { activateList } = response.data;
        console.log("activateList:", activateList);

        // 이번 주 날짜 배열 (월~일)
        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          weekDates.push(d.toISOString().split("T")[0]);
        }

        // days 배열 만들기
        const dayArray = weekDates.map((date) => {
          if (date === today.toISOString().split("T")[0]) return 2; // 오늘
          if (activateList.includes(date)) return 1; // 참여
          return 0; // 참여X
        });

        setDays(dayArray);
      } catch (error: any) {
        if (error.response) {
          console.error(
            "API 호출 실패:",
            error.response.status,
            error.response.data
          );
        } else {
          console.error("API 호출 실패:", error.message);
        }
      }
    };

    fetchWeeklyData();
  }, []);

  return (
    <View className="">
      <View className="flex-row justify-between">
        {days.map((status, index) => {
          let bgColor = "";
          let textColor = "";
          let borderColor = "";

          switch (status) {
            case 0:
              bgColor = "bg-[#4E4E4E]";
              textColor = "text-[#4E4E4E]";
              borderColor = "border-[#4E4E4E]";
              break;
            case 1:
              bgColor = "bg-white";
              textColor = "text-white";
              borderColor = "border-white";
              break;
            case 2:
              bgColor = "bg-[#E9690D]";
              textColor = "text-[#E9690D]";
              borderColor = "border-[#E9690D]";
              break;
          }

          return (
            <View
              key={index}
              className={`${borderColor} border rounded-md items-center w-10 h-14 justify-center`}
            >
              <Text className={`${textColor} text-[11px] mb-3`}>
                {weekdays[index]}
              </Text>
              <View className={`${bgColor} w-2 h-2 rounded-full`} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
