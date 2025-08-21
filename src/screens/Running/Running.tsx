import React from "react";
import { View, ScrollView } from "react-native";

import Header from "src/components/Header";
import RunningTracker from "./components/RunningTracker";
import RunningPoints from "./components/RunningPoints";
import RunningDetail from "./components/RunningDetail";
import { RunningProvider } from "./context/RunningContext";

export default function Running() {
  return (
    <RunningProvider>
      <ScrollView
        className="flex-1 bg-[#101010]"
        showsVerticalScrollIndicator={false}>
        <View className="px-3">
          <Header title="Running" />
          <RunningTracker />
          <RunningPoints />
          <RunningDetail />
        </View>
      </ScrollView>
    </RunningProvider>
  );
}
