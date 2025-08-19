import React from "react";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Main from "src/screens/Main/Main";
import Walking from "src/screens/Walking/Walking";
import Running from "src/screens/Running/Running";
import Challenge from "src/screens/Challenge/Challenge";
import MovingSpot from "src/screens/movingSpot/MovingSpot";

import Store from "src/screens/Store/Store";
import ExchangeDetail from "src/screens/Store/CouponDetail/ExchangeDetail";
import UseCoupon from "src/screens/Store/MyCoupon/UseCoupon";
import UseCouponDetail from "src/screens/Store/CouponDetail/UseCouponDetail";
import PointMain from "src/screens/Point/PointMain";
import MyPage from "src/screens/MyPage/MyPage";
import AvailablePoints from "src/screens/Point/AvailablePoints";
import UsePoint from "src/screens/Point/UsePoint";

import Splash from "src/screens/Member/Splash";
import Login from "src/screens/Member/Login";
import Nickname from "src/screens/Member/Nickname";
import Id from "src/screens/Member/Id";
import Pw from "src/screens/Member/Pw";
import Start from "src/screens/Member/Start";

import Bar from "src/components/Bar";

export type RootTabParamList = {
  MainTab: undefined;
  StoreTab: undefined;
  PointTab: undefined;
  MyPageTab: undefined;
  StartTab: undefined;
};

export type StartStackParamList = {
  Splash: undefined;
  Login: undefined;
  Nickname: undefined;
  Id: undefined;
  Pw: undefined;
  Start: undefined;
};

export type MainStackParamList = {
  Main: undefined;
  AvailablePoints: undefined;
  UsePoint: undefined;
  Walking: undefined;
  Running: undefined;
  Challenge: undefined;
  MovingSpot: undefined;
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

const Tab = createBottomTabNavigator<RootTabParamList>();
const StartStack = createNativeStackNavigator<StartStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const StoreStack = createNativeStackNavigator<StoreStackParamList>();
const PointStack = createNativeStackNavigator<PointStackParamList>();
const MyPageStack = createNativeStackNavigator<MyPageStackParamList>();

//만약 보고 싶은 화면이 있는데 넘어가는게 아직 없다?
//=> 여기 stackScreen안에서 순서 바꾼 다음에 리로드하면 잘 보입니당
function StartStackScreen() {
  return (
    <StartStack.Navigator screenOptions={{ headerShown: false }}>
      <StartStack.Screen name="Splash" component={Splash} />
      <StartStack.Screen name="Login" component={Login} />
      <StartStack.Screen name="Nickname" component={Nickname} />
      <StartStack.Screen name="Id" component={Id} />
      <StartStack.Screen name="Pw" component={Pw} />
      <StartStack.Screen name="Start" component={Start} />
    </StartStack.Navigator>
  );
}

function MainStackScreen() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Main" component={Main} />
      <MainStack.Screen name="AvailablePoints" component={AvailablePoints} />
      <MainStack.Screen name="UsePoint" component={UsePoint} />
      <MainStack.Screen name="Walking" component={Walking} />
      <MainStack.Screen name="Running" component={Running} />
      <MainStack.Screen name="Challenge" component={Challenge} />
      <MainStack.Screen name="MovingSpot" component={MovingSpot} />
    </MainStack.Navigator>
  );
}

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

function PointStackScreen() {
  return (
    <PointStack.Navigator screenOptions={{ headerShown: false }}>
      <PointStack.Screen name="PointMain" component={PointMain} />
      <PointStack.Screen name="AvailablePoints" component={AvailablePoints} />
      <PointStack.Screen name="UsePoint" component={UsePoint} />
    </PointStack.Navigator>
  );
}

function MyPageStackScreen() {
  return (
    <MyPageStack.Navigator screenOptions={{ headerShown: false }}>
      <MyPageStack.Screen name="MyPage" component={MyPage} />
    </MyPageStack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="MainTab"
        tabBar={(props) => <Bar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen
          name="MainTab"
          component={MainStackScreen}
          options={{ title: "메인" }}
        />
        <Tab.Screen
          name="StoreTab"
          component={StoreStackScreen}
          options={{ title: "상점" }}
        />
        <Tab.Screen
          name="PointTab"
          component={PointStackScreen}
          options={{ title: "포인트" }}
        />
        <Tab.Screen
          name="MyPageTab"
          component={MyPageStackScreen}
          options={{ title: "마이페이지" }}
        />
        <Tab.Screen
          name="StartTab"
          component={StartStackScreen}
          options={{ title: "시작화면" }}
          //시작화면은 일단 작업할때 사용하고 나중에 수정합시당
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
