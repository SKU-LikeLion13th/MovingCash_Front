import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  Animated,
  ImageSourcePropType,
  Image,
} from "react-native";
import X from "../../../assets/icons/X.svg";

type Props = {
  visible: boolean;
  onClose: () => void;
  onClaim: () => void;
  title?: string; // 예) "천 보 걷기 챌린지"
  headline?: string; // 예) "챌린지 성공!"
};

export default function ChallengeModal({
  visible,
  onClose,
  onClaim,
  title = "천 보 걷기 챌린지",
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      opacity.setValue(0);
      scale.setValue(0.96);
    }
  }, [visible, opacity, scale]);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          opacity,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
          marginBottom: 30,
        }}
      >
        {/* 카드 */}
        <Animated.View
          style={{
            width: "100%",
            maxWidth: 420,
            height: 380,
            backgroundColor: "#151515",
            borderRadius: 20,
            paddingVertical: 28,
            paddingHorizontal: 24,
            transform: [{ scale }],
          }}
        >
          {/* 닫기 버튼 */}
          <Pressable
            onPress={onClose}
            style={{ position: "absolute", top: 14, right: 14, padding: 8 }}
          >
            <X />
          </Pressable>

          <View className="h-full items-center justify-center">
            {/* 배지 */}
            <Image
              className="w-32 h-32 mt-4"
              source={require("../../../assets/images/Challenge/Success.png")}
            />

            {/* 텍스트들 */}
            <View className="mt-10 items-center">
              <Text className="text-[#999999]">
                {title}
              </Text>
              <Text className="text-white text-2xl font-bold mt-2">챌린지 성공!</Text>

              <Pressable
                onPress={onClaim}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 6,
                  justifyContent: "center",
                  marginTop:17
                }}
              >
                <Text className="text-[#D4D4D4] font-light text-lg">
                  포인트 받기{"  >"}
                </Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        <Pressable
          onPress={onClose}
          style={{ position: "absolute", inset: 0 }}
        />
      </Animated.View>
    </Modal>
  );
}
