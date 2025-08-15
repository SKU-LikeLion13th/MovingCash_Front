import { NativeRouter, Routes, Route } from "react-router-native";
import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import Main from "src/screens/Main/Main";
import PointMain from "src/screens/Point/PointMain";
import Splash from "src/screens/Member/Splash";
import Login from "src/screens/Member/Login";

export default function App() {
  return (
    <NativeRouter>
      <Routes>
        <Route path="/*" element={<Login />} />
        <Route path="/*" element={<Splash />} />
        <Route path="/*" element={<Main />} />
        <Route path="/*" element={<PointMain />} />
      </Routes>
    </NativeRouter>
  );
}
