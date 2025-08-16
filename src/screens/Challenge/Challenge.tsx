import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  ImageSourcePropType,
} from "react-native";
import Header from "src/components/Header";
import ChallengeCard from "./ChallengeCard";

type LevelCode = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type ActivityCode = "RUNNING" | "WALKING";

type ChallengeItem = {
  id: number;
  level: LevelCode; // "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  activity: ActivityCode; // "RUNNING" | "WALKING"
  title: string;
  reward: number;
  status: boolean; // 유저 참여 여부
};

//연결
const LEVEL_KR: Record<LevelCode, "초급" | "중급" | "고급"> = {
  BEGINNER: "초급",
  INTERMEDIATE: "중급",
  ADVANCED: "고급",
};
const ACTIVITY_KR: Record<ActivityCode, "러닝" | "걷기"> = {
  RUNNING: "러닝",
  WALKING: "걷기",
};

// 카드 사이즈랑 배경색
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 24;
const GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;
const CARD_HEIGHT = 240;
const BG_COLORS = ["#CFE8FF", "#FFE68A", "#FFD3B6", "#E2FFD1"];

const IMAGE_BY_ACTIVITY: Record<ActivityCode, ImageSourcePropType> = {
  RUNNING: require("../../../assets/images/Challenge/Running.png"),
  WALKING: require("../../../assets/images/Challenge/Running.png"),
};

//더미데이터
const ALL: ChallengeItem[] = [
  {
    id: 1,
    level: "BEGINNER",
    activity: "WALKING",
    title: "1000 보 걷기",
    reward: 1000,
    status: false,
  },
  {
    id: 2,
    level: "BEGINNER",
    activity: "RUNNING",
    title: "1km 러닝",
    reward: 1000,
    status: false,
  },
  {
    id: 3,
    level: "BEGINNER",
    activity: "WALKING",
    title: "30분 걷기",
    reward: 1000,
    status: false,
  },
  {
    id: 4,
    level: "BEGINNER",
    activity: "RUNNING",
    title: "5분 뛰기",
    reward: 1000,
    status: true,
  },

  {
    id: 5,
    level: "INTERMEDIATE",
    activity: "WALKING",
    title: "만보 걷기",
    reward: 2000,
    status: false,
  },
  {
    id: 6,
    level: "INTERMEDIATE",
    activity: "RUNNING",
    title: "5km 러닝",
    reward: 2000,
    status: true,
  },
  {
    id: 7,
    level: "INTERMEDIATE",
    activity: "WALKING",
    title: "1시간 걷기",
    reward: 2000,
    status: false,
  },
  {
    id: 8,
    level: "INTERMEDIATE",
    activity: "RUNNING",
    title: "10분 뛰기",
    reward: 2000,
    status: false,
  },

  {
    id: 9,
    level: "ADVANCED",
    activity: "WALKING",
    title: "2만보 걷기",
    reward: 3000,
    status: false,
  },
  {
    id: 10,
    level: "ADVANCED",
    activity: "RUNNING",
    title: "10km 러닝",
    reward: 3000,
    status: false,
  },
  {
    id: 11,
    level: "ADVANCED",
    activity: "WALKING",
    title: "2시간 걷기",
    reward: 3000,
    status: true,
  },
  {
    id: 12,
    level: "ADVANCED",
    activity: "RUNNING",
    title: "30분 뛰기",
    reward: 3000,
    status: false,
  },
];

//토글안에서 버튼을 껐다켰다하는 함수
function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

//필터 로직
function filterItems(
  data: ChallengeItem[],
  selectedLevels: LevelCode[],
  selectedActivities: ActivityCode[]
) {
  return data.filter((item) => {
    const passLevel =
      selectedLevels.length === 0 || selectedLevels.includes(item.level);
    const passActivity =
      selectedActivities.length === 0 ||
      selectedActivities.includes(item.activity);
    return passLevel && passActivity;
  });
}

export default function Challenge() {
  // 레벨/액티비티 각각 다중선택
  const [selectedLevels, setSelectedLevels] = useState<LevelCode[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<ActivityCode[]>(
    []
  );

  // 전체 - 둘 다 초기화
  const clearAll = () => {
    setSelectedLevels([]);
    setSelectedActivities([]);
  };

  const data = useMemo(
    () => filterItems(ALL, selectedLevels, selectedActivities),
    [selectedLevels, selectedActivities]
  );

  //카테고리 컴포넌트
  const Chip = ({
    label,
    active,
    onPress,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className={[
        "px-4 py-1 rounded-full border mr-2 mb-2",
        active ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300",
      ].join(" ")}
    >
      <Text
        className={[
          "text-[10px] font-semibold",
          active ? "text-white" : "text-gray-700",
        ].join(" ")}
      >
        {label}
      </Text>
    </Pressable>
  );

  // 카드 렌더러
  const renderItem = ({
    item,
    index,
  }: {
    item: ChallengeItem;
    index: number;
  }) => {
    const bg = BG_COLORS[index % BG_COLORS.length];
    const imageSource = IMAGE_BY_ACTIVITY[item.activity];
    return (
      <ChallengeCard
        item={item}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        bgColor={bg}
        imageSource={imageSource}
        onPress={() => {}}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#101010]">
      <Header title="Challenge" />

      <View className="w-full items-center mb-4">
        <Image
          source={require("../../../assets/images/Challenge/shoesAD.png")}
          className="w-96"
          resizeMode="contain"
        />
      </View>

      <View className="flex-1 bg-white rounded-t-3xl pt-8">
        <FlatList
          data={data}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingTop: 12,
            paddingBottom: 48,
            paddingHorizontal: H_PADDING,
          }}
          style={{ alignSelf: "stretch" }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {/* 상단 문구 */}
              <View className="w-full items-center">
                <Text className="font-extrabold">챌린지에 도전하면,</Text>
                <Text className="pt-[14px] text-[22px] font-black">
                  12,140 더 받을 수 있어요!
                </Text>
              </View>

              {/* 필터 영역 */}
              <View className="w-full my-5 items-center px-6">
                <View className="flex-row flex-wrap">
                  <Chip
                    label="전체"
                    active={
                      selectedLevels.length === 0 &&
                      selectedActivities.length === 0
                    }
                    onPress={clearAll}
                  />
                  {(
                    ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as LevelCode[]
                  ).map((lv) => (
                    <Chip
                      key={lv}
                      label={LEVEL_KR[lv]}
                      active={selectedLevels.includes(lv)}
                      onPress={() =>
                        setSelectedLevels((prev) => toggleIn(prev, lv))
                      }
                    />
                  ))}
                </View>
                <View className="flex-row flex-wrap">
                  {(["WALKING", "RUNNING"] as ActivityCode[]).map((ac) => (
                    <Chip
                      key={ac}
                      label={ACTIVITY_KR[ac]}
                      active={selectedActivities.includes(ac)}
                      onPress={() =>
                        setSelectedActivities((prev) => toggleIn(prev, ac))
                      }
                    />
                  ))}
                </View>
              </View>
            </>
          }
        />
      </View>
    </View>
  );
}
