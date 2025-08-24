import Header from "src/components/Header";
import WalkingTracker from "./components/WalkingTracker";
import WalkingPoints from "./components/WalkingPoints";
import WalkingDetail from "./components/WalkingDetail";
import { View, ScrollView } from "react-native";
import { WalkingProvider } from "./context/WalkingContext";

export default function Walking() {
  return (
    <WalkingProvider>
      <View className="flex-1 bg-[#101010]">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-3">
            <Header title="Walking" />
            <WalkingTracker />
            <WalkingPoints />
          </View>
        </ScrollView>

        {/* 하단 BottomSheet */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "100%",
          }}>
          <WalkingDetail />
        </View>
      </View>
    </WalkingProvider>
  );
}
