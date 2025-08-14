import { NativeRouter, Routes, Route } from "react-router-native";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Main from "src/screens/Main/Main";
import Running from "src/screens/Activity/Running/Running";

export default function App() {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/*" element={<Main />} />
        <Route path="/running" element={<Running />} />
      </Routes>
    </NativeRouter>
  );
}
