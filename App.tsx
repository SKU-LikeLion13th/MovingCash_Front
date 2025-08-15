import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "src/screens/Main/Main";
import PointMain from "src/screens/Point/PointMain";
import AvailablePoints from "src/screens/Point/AvailablePoints";
import Splash from "src/screens/Member/Splash";
import Login from "src/screens/Member/Login";

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
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
