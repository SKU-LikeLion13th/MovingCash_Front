import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import Profile from "./Profile";
import WeeklyRunning from "./WeeklyRunning";
import RecentMoving from "./RecentMoving";
import StartNow from "./StartNow";
import Map from "src/components/Map";

export default function Main() {
  return (
    <ScrollView className="h-full bg-[#101010] px-5">
      <View className="mt-16">
        <Profile />
      </View>
      <View className="mt-8">
        <WeeklyRunning />
      </View>
      <View className="mt-8">
        <RecentMoving />
      </View>
      <View className="mt-8">
        <Map />
      </View>
      <View className="mt-8">
        <StartNow />
      </View>
    </ScrollView>
  );
}
