// src/components/ProfileAvatarRing.tsx
import React, { useMemo } from "react";
import { View, Image, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  uri?: string;              
  size?: number;             
  strokeWidth?: number;      
  arcRatio?: number;         
  ringColor?: string;
  startAtTop?: boolean;      
};

export default function ProfileAvatarRing({
  uri = "https://picsum.photos/200",
  size = 96,
  strokeWidth = 6,
  arcRatio = 0.75,           
  ringColor = "#F38C1A",
  startAtTop = true,
}: Props) {
  const radius = useMemo(() => (size - strokeWidth) / 2, [size, strokeWidth]);
  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  // 이미지 크기는 링 안쪽에 깔끔히 들어가도록
  const imageSize = size - strokeWidth * 2;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={typeof uri === "string" ? { uri } : uri}
        style={{
          width: imageSize,
          height: imageSize,
          borderRadius: imageSize / 2,
        }}
        resizeMode="cover"
      />

      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
        <Circle
          stroke={ringColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * arcRatio}, ${circumference}`}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
    left: 0,
    top: 0,
  },
});
