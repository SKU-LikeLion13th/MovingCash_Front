import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ImageSourcePropType,
} from "react-native";

type LevelCode = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type ActivityCode = "RUNNING" | "WALKING";

type ChallengeItem = {
  id: number;
  level: LevelCode;
  activity: ActivityCode;
  title: string;
  reward: number;
  status: boolean;
};

const LEVEL_KR: Record<LevelCode, "초급" | "중급" | "고급"> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};
const ACTIVITY_KR: Record<ActivityCode, "러닝" | "걷기"> = {
  RUNNING: "러닝",
  WALKING: "걷기",
};

type Props = {
  item: ChallengeItem;
  width: number;
  height: number;
  bgColor: string;
  imageSource: ImageSourcePropType;
  onPress?: (item: ChallengeItem) => void;
  className?: string;
};

export default function ChallengeCard({
  item,
  width,
  height,
  bgColor,
  imageSource,
  onPress,
  className,
}: Props) 

{
  return (
    <Pressable
      style={{
        position: "relative", 
        width,
        height,
        backgroundColor: bgColor,
        borderRadius: 16,
        marginBottom: 12,
        overflow: "hidden", 
        elevation: 2,
      }}
      className={["shadow", className ?? ""].join(" ")}
      onPress={() => onPress?.(item)}
    >
      <Image
        source={imageSource}
        style={{
          width: width*0.7,
          height: undefined,
          aspectRatio: 1,
        }}
        resizeMode="contain"
      />

      {/*참여 여부 띄우기*/}
      {item.status && (
        <View className="absolute left-3 top-3 bg-black/70 px-2 py-1 rounded-full">
          <Text className="text-[10px] text-white">참여중</Text>
        </View>
      )}

      {/* Text Area */}
      <View className="absolute left-4 bottom-4">
        <Text className="text-[14px] font-semibold text-black opacity-80">
          {item.title}
        </Text>

        <View className="flex-row items-center mt-1">
          <Text className="text-[20px] font-extrabold text-black">
            {item.reward.toLocaleString()}
          </Text>
          <Text className="ml-1 text-[12px] font-bold text-[#E59A00]">P</Text>
        </View>

        <Text className="text-[12px] text-black opacity-70 mt-1">
          {LEVEL_KR[item.level]} · {ACTIVITY_KR[item.activity]}
        </Text>
      </View>
    </Pressable>
  );
}
