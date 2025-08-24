import React from "react";
import { View, ScrollView } from "react-native";

import Header from "src/components/Header";
import RunningTracker from "./components/RunningTracker";
import RunningPoints from "./components/RunningPoints";
import RunningDetail from "./components/RunningDetail";
import Map from "src/components/Map";
import { RunningProvider } from "./context/RunningContext";

export default function Running() {
  return (
    <RunningProvider>
      <ScrollView
        className="flex-1 bg-[#101010]"
        showsVerticalScrollIndicator={false}>
        <View className="px-3 pb-10">
          <Header title="Running" />
          <RunningTracker />
          <RunningPoints />
          <RunningDetail />
          <Map />
        </View>
      </ScrollView>
    </RunningProvider>
  );
}
