import React from "react";
import { View, Text, Image } from "react-native";
import Profile from "./Profile";
import WeeklyRunning from "./WeeklyRunning";
import RecentMoving from "./RecentMoving";
import NavigateButton from "../Activity/Common/components/NavigateButton";

export default function Main() {
  return (
    <View className="flex-1 bg-[#101010] px-5">
      <View className="mt-16">
        <Profile />
      </View>
      <View className="mt-2">
        <WeeklyRunning />
      </View>
      <View className="mt-2">
        <RecentMoving />
      </View>

      <View>
        <NavigateButton />
      </View>
    </View>
  );
}
