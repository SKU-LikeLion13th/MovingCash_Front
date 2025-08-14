import React from "react";
import { View, Text } from "react-native";

export default function WeeklyRunning() {
  // 0 = 참여X, 1 = 참여, 2 = 오늘
  const days = [1, 0, 1, 1, 0, 2, 0];
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <View className="mt-5 ">
      <View className="flex-row justify-between">
        {weekdays.map((day, index) => {
          let bgColor = "";
          let textColor = "";
          let borderColor = "";
          switch (days[index]) {
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
              <Text className={`${textColor} text-[11px] mb-3`}>{day}</Text>
              <View className={`${bgColor} w-2 h-2 rounded-full`}></View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
