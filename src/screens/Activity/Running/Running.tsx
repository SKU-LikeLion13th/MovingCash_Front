import React from "react";
import { View } from "react-native";

import MotivationText from "../Common/components/MotivationText";
import ActivityTitle from "../Common/components/ActivityTitle";
import RunningTracker from "./components/RunningTracker";

export default function Running() {
  return (
    <View className="flex-1 bg-[#101010] pt-16 px-3">
      <ActivityTitle activity="run" />
      <MotivationText activity="run" status="finish" />
      <RunningTracker />
    </View>
  );
}
