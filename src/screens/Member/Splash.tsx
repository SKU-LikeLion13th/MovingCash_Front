import React, { useEffect, useRef } from "react";
import { View, Animated, Image } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StartStackParamList } from "../../../App";

type SplashScreenNavigationProp = NativeStackNavigationProp<
  StartStackParamList,
  "Splash"
>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

export default function Splash({ navigation }: Props) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace("Login"); // Login으로 이동
      });
    }, 1000);
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#101010",
        opacity: fadeAnim,
      }}>
      <Image
        source={require("../../../assets/images/splash.png")}
        style={{ width: 176, height: 176, marginBottom: 32 }}
        resizeMode="contain"
      />
    </Animated.View>
  );
}
