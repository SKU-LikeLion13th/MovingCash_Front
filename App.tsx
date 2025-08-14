import { NativeRouter, Routes, Route } from "react-router-native";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Main from "src/screens/Main/Main";

export default function App() {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/*" element={<Main />} />
      </Routes>
    </NativeRouter>
  );
}
