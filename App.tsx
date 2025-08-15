import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "src/screens/Main/Main";
import Bar from "src/components/Bar";
import Store from "src/screens/Store/Store";
import PointMain from "src/screens/Point/PointMain";
import AvailablePoints from "src/screens/Point/AvailablePoints";

export type RootStackParamList = {
  PointMain: undefined;
  Main: undefined;
  AvailablePoints: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="PointMain" component={PointMain} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="AvailablePoints" component={AvailablePoints} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
