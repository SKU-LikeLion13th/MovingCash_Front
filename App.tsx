import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "src/screens/Main/Main";
import PointMain from "src/screens/Point/PointMain";
import AvailablePoints from "src/screens/Point/AvailablePoints";
import UsePoint from "src/screens/Point/UsePoint";

// React Navigation에서는 Stack Navigator에 등록한 스크린 이름, 파라미터 타입을 먼저 정의하고,
// useNavigation에 알려줘야해

// 1. StackParamList 정의
// PointMain, Main, AvailablePoints 스크린이 있음
// undefined는 해당 스크린에 전달할 파라미터가 없다는 뜻
// 예: 만약 AvailablePoints가 userId: string을 필요로 하면 AvailablePoints: { userId: string } 이렇게 정의
export type RootStackParamList = {
  PointMain: undefined;
  Main: undefined;
  AvailablePoints: undefined;
  UsePoint: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PointMain" component={PointMain} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="AvailablePoints" component={AvailablePoints} />
        <Stack.Screen name="UsePoint" component={UsePoint} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
