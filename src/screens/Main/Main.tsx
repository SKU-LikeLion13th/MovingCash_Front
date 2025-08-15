import React from "react";
import { View, Text, Image } from "react-native";
import Profile from "./Profile";
import WeeklyRunning from "./WeeklyRunning";
import RecentMoving from "./RecentMoving";
import StartNow from "./StartNow";

export default function Main() {
  return (
    <View className="h-full bg-[#101010] px-5">
      <View className="mt-16">
        <Profile />
      </View>
      <View className="mt-8">
        <WeeklyRunning />
      </View>
      <View className="mt-8">
        <RecentMoving />
      </View>
    </View>
  );
}
