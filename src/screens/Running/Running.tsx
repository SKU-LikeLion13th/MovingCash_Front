import React from "react";
import { View } from "react-native";

import Header from "src/components/Header";
import RunningTracker from "./components/RunningTracker";
import RunningPoints from "./components/RunningPoints";
import RunningDetail from "./components/RunningDetail";

export default function Running() {
  return (
    <View className="flex-1 bg-[#101010] px-3">
      <Header title="Running" />
      <RunningTracker />
      <RunningPoints />
      <RunningDetail />
    </View>
  );
}
