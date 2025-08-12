import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 bg-black items-center justify-center">
      <Text className="text-white text-lg">이거지</Text>
      <StatusBar style="light" />
    </View>
  );
}
