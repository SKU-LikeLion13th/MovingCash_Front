import React from "react";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import Main from "src/screens/Main/Main";
import Walking from "src/screens/Walking/Walking";
import Running from "src/screens/Running/Running";
import Challenge from "src/screens/Challenge/Challenge";
import ChallengeDetail from "src/screens/Challenge/ChallengeDetail";
import MovingSpot from "src/screens/movingSpot/MovingSpot";
import Onboarding from "src/screens/movingSpot/Onboarding";
import MovingSpotResult from "src/screens/movingSpot/MovingSpotResult";

import Store from "src/screens/Store/Store";
import ExchangeDetail from "src/screens/Store/CouponDetail/ExchangeDetail";
import UseCoupon from "src/screens/Store/MyCoupon/UseCoupon";
import UseCouponDetail from "src/screens/Store/CouponDetail/UseCouponDetail";

import PointMain from "src/screens/Point/PointMain";
import AvailablePoints from "src/screens/Point/AvailablePoints";
import UsePoint from "src/screens/Point/UsePoint";

import MyPage from "src/screens/MyPage/MyPage";

import Map from "src/components/Map";
import RealTimeMap from "src/components/RealTimeMap";
import Splash from "src/screens/Member/Splash";
import Login from "src/screens/Member/Login";
import Signup from "src/screens/Member/Signup";
import Start from "src/screens/Member/Start";

import Bar from "src/components/Bar";

// 타입 정의
export type RootTabParamList = {
  MainTab: undefined;
  StoreTab: undefined;
  PointTab: undefined;
  MyPageTab: undefined;
};

export type StartStackParamList = {
  Map: undefined;
  RealTimeMap: undefined;
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  Start: undefined;
};

export type MainStackParamList = {
  Main: undefined;
  AvailablePoints: undefined;
  UsePoint: undefined;
  Walking: undefined;
  Running: undefined;
  Challenge: undefined;
  ChallengeDetail: {
    id: number;
    title: string;
    reward: number;
    activity: string;
  };
  MovingSpot: undefined;
  Onboarding: undefined;
  MovingSpotResult: {
    themes: { label: string; emoji?: string }[];
    difficulty: { label: string; emoji?: string }[];
    prefs: { label: string; emoji?: string }[];
  };
};

export type StoreStackParamList = {
  Store: undefined;
  ExchangeDetail: { item: any };
  UseCoupon: undefined;
  UseCouponDetail: { coupon: any };
};

export type PointStackParamList = {
  PointMain: undefined;
  AvailablePoints: undefined;
  UsePoint: undefined;
};

export type MyPageStackParamList = {
  MyPage: undefined;
};

export type RootStackParamList = {
  StartStack: undefined;
  MainTabs: undefined;
};

// Navigator 생성
const Tab = createBottomTabNavigator<RootTabParamList>();
const StartStack = createNativeStackNavigator<StartStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const StoreStack = createNativeStackNavigator<StoreStackParamList>();
const PointStack = createNativeStackNavigator<PointStackParamList>();
const MyPageStack = createNativeStackNavigator<MyPageStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

// StartStack
function StartStackScreen() {
  return (
    <StartStack.Navigator screenOptions={{ headerShown: false }}>
      <StartStack.Screen name="Splash" component={Splash} />
      <StartStack.Screen name="Login" component={Login} />
      <StartStack.Screen name="Signup" component={Signup} />
      <StartStack.Screen name="Map" component={Map} />
      <StartStack.Screen name="RealTimeMap" component={RealTimeMap} />
      <StartStack.Screen name="Start" component={Start} />
    </StartStack.Navigator>
  );
}

// MainStack
function MainStackScreen() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Main" component={Main} />
      <MainStack.Screen name="AvailablePoints" component={AvailablePoints} />
      <MainStack.Screen name="UsePoint" component={UsePoint} />
      <MainStack.Screen name="Walking" component={Walking} />
      <MainStack.Screen name="Running" component={Running} />
      <MainStack.Screen name="Challenge" component={Challenge} />
      <MainStack.Screen name="ChallengeDetail" component={ChallengeDetail} />
      <MainStack.Screen name="MovingSpot" component={MovingSpot} />
      <MainStack.Screen name="Onboarding" component={Onboarding} />
      <MainStack.Screen name="MovingSpotResult" component={MovingSpotResult} />
    </MainStack.Navigator>
  );
}

// StoreStack
function StoreStackScreen() {
  return (
    <StoreStack.Navigator screenOptions={{ headerShown: false }}>
      <StoreStack.Screen name="Store" component={Store} />
      <StoreStack.Screen name="ExchangeDetail" component={ExchangeDetail} />
      <StoreStack.Screen name="UseCoupon" component={UseCoupon} />
      <StoreStack.Screen name="UseCouponDetail" component={UseCouponDetail} />
    </StoreStack.Navigator>
  );
}

// PointStack
function PointStackScreen() {
  return (
    <PointStack.Navigator screenOptions={{ headerShown: false }}>
      <PointStack.Screen name="PointMain" component={PointMain} />
      <PointStack.Screen name="AvailablePoints" component={AvailablePoints} />
      <PointStack.Screen name="UsePoint" component={UsePoint} />
    </PointStack.Navigator>
  );
}

// MyPageStack
function MyPageStackScreen() {
  return (
    <MyPageStack.Navigator screenOptions={{ headerShown: false }}>
      <MyPageStack.Screen name="MyPage" component={MyPage} />
    </MyPageStack.Navigator>
  );
}

// TabNavigator
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MainTab"
      tabBar={(props) => <Bar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="MainTab" component={MainStackScreen} options={{ title: "메인" }} />
      <Tab.Screen name="StoreTab" component={StoreStackScreen} options={{ title: "상점" }} />
      <Tab.Screen name="PointTab" component={PointStackScreen} options={{ title: "포인트" }} />
      <Tab.Screen name="MyPageTab" component={MyPageStackScreen} options={{ title: "마이페이지" }} />
    </Tab.Navigator>
  );
}

// App
export default function App() {
  const [fontsLoaded] = useFonts({
    NotoBold: require("./assets/fonts/NotoSansKR-Bold.ttf"),
    NotoSemiBold: require("./assets/fonts/NotoSansKR-SemiBold.ttf"),
    NotoMedium: require("./assets/fonts/NotoSansKR-Medium.ttf"),
    NotoRegular: require("./assets/fonts/NotoSansKR-Regular.ttf"),
    PoppinsBold: require("./assets/fonts/Poppins-Bold.ttf"),
    PoppinsSemiBold: require("./assets/fonts/Poppins-SemiBold.ttf"),
    PoppinsMedium: require("./assets/fonts/Poppins-Medium.ttf"),
    PoppinsRegular: require("./assets/fonts/Poppins-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* 앱 시작 시 Splash가 있는 StartStack */}
          <RootStack.Screen name="StartStack" component={StartStackScreen} />
          {/* 로그인/회원가입 후 이동하는 메인 탭 */}
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        </RootStack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
