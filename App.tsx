import { NativeRouter, Routes, Route } from "react-router-native";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Main from "src/screens/Main/Main";
import Bar from "src/components/Bar";
import Store from "src/screens/Store/Store";
import PointMain from "src/screens/Point/PointMain";
import MyPage from "src/screens/MyPage/MyPage";

export default function App() {
  return (
    <NativeRouter>
      <View className="flex-1">
        <View className="flex-1">
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/store" element={<Store />} />
            <Route path="/point" element={<PointMain />} />
            <Route path="/mypage" element={<MyPage />} />
          </Routes>
        </View>
        <Bar />
      </View>
    </NativeRouter>
  );
}
