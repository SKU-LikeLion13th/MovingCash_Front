import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import {
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  ImageSourcePropType,
  ImageStyle,
  RefreshControl,
  Alert,
} from "react-native";
import Header from "src/components/Header";
import ChallengeCard from "./ChallengeCard";
import Point from "../../../assets/icons/Point.svg";
import { MainStackParamList } from "App";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LevelCode = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type ActivityCode = "RUNNING" | "WALKING";
type ActivityImage = {
  src: ImageSourcePropType;
  style?: ImageStyle;
};

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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PADDING = 24;
const GAP = 15;
const CARD_WIDTH = (SCREEN_WIDTH - H_PADDING * 2 - GAP) / 2;
const CARD_HEIGHT = 260;
const BG_COLORS = ["#B8DDFF", "#F9E482", "#FFBF92", "#E7F982"];

const IMAGE_BY_ACTIVITY: Record<ActivityCode, ActivityImage> = {
  RUNNING: {
    src: require("../../../assets/images/Challenge/Running.png"),
    style: { width: "75%", height: "75%" },
  },
  WALKING: {
    src: require("../../../assets/images/Challenge/walking.png"),
    style: { width: "75%", height: "75%", marginRight: 22 },
  },
};

function toggleIn<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
}

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

const normalizeLevel = (v: any): LevelCode => {
  const s = String(v || "").toUpperCase();
  if (s === "BEGINNER" || s === "INTERMEDIATE" || s === "ADVANCED") return s;
  return "BEGINNER";
};

const normalizeActivity = (v: any): ActivityCode => {
  const s = String(v || "").toUpperCase();
  if (s === "RUNNING" || s === "WALKING") return s;
  // 혹시 서버가 RUN/WALK 같은 값을 준다면 안전망
  if (s.startsWith("RUN")) return "RUNNING";
  if (s.startsWith("WALK")) return "WALKING";
  return "WALKING";
};

const toNumber = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// 서버 응답 → 내부 모델 변환(필드명이 달라도 최대한 흡수)
function mapServerItem(row: any): ChallengeItem {
  return {
    id: toNumber(row?.id),
    level: normalizeLevel(row?.level ?? row?.difficulty),
    activity: normalizeActivity(row?.activity ?? row?.type),
    title: String(row?.title ?? row?.name ?? "제목 없음"),
    reward: toNumber(row?.reward ?? row?.point, 0),
    status: Boolean(row?.status ?? row?.joined ?? false),
  };
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function Challenge() {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const handlePress = useCallback(
    (item: ChallengeItem) => {
      navigation.navigate("ChallengeDetail", {
        id: item.id,
        title: item.title,
        reward: item.reward,
        activity: item.activity,
      });
    },
    [navigation]
  );

  const [selectedLevels, setSelectedLevels] = useState<LevelCode[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<ActivityCode[]>(
    []
  );
  const [all, setAll] = useState<ChallengeItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const clearAll = () => {
    setSelectedLevels([]);
    setSelectedActivities([]);
  };

  const data = useMemo(
    () =>
      filterItems(all, selectedLevels, selectedActivities)
        .slice()
        .sort((a, b) => {
          if (a.status === b.status) return 0;
          return a.status ? 1 : -1;
        }),
    [all, selectedLevels, selectedActivities]
  );

  const totalReward = useMemo(
    () => all.reduce((sum, item) => sum + item.reward, 0),
    [all]
  );

  const fetchChallenges = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("로그인이 필요해요", "다시 로그인해 주세요.");
        setAll([]);
        return;
      }
      const date = todayStr();
      const res = await axios.get(
        `http://movingcash.sku-sku.com/challenge/all/${date}`,
        {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      const mapped: ChallengeItem[] = list.map(mapServerItem);
      setAll(mapped);
    } catch (e: any) {
      console.warn("challenge fetch error:", e?.response?.status, e?.message);
      Alert.alert("불러오기 실패", "챌린지 목록을 불러오지 못했어요.");
      setAll([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  //ui
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

  const renderItem = ({
    item,
    index,
  }: {
    item: ChallengeItem;
    index: number;
  }) => {
    const bg = BG_COLORS[index % BG_COLORS.length];
    const { src, style: imgStyle } = IMAGE_BY_ACTIVITY[item.activity];

    return (
      <ChallengeCard
        item={item}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        bgColor={bg}
        imageSource={src}
        imageStyle={imgStyle}
        onPress={handlePress}
      />
    );
  };

  return (
    <View className="flex-1 bg-[#101010]">
      <Header title="Challenge" />
      <FlatList
        data={data}
        keyExtractor={(it) => String(it.id)}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        style={{ flex: 1, alignSelf: "stretch", backgroundColor: "#fff" }}
        contentContainerStyle={{
          paddingBottom: 15,
          paddingHorizontal: H_PADDING,
          rowGap: 5,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchChallenges} />
        }
        ListHeaderComponent={
          <>
            <View
              style={{
                backgroundColor: "#101010",
                paddingBottom: 0,
                marginHorizontal: -H_PADDING,
              }}
            >
              <View className="w-full items-center mb-4">
                <Image
                  source={require("../../../assets/images/Challenge/shoesAD.png")}
                  style={{ width: "95%", height: 120, marginBottom: 20 }}
                  resizeMode="contain"
                />
              </View>
            </View>
            <View
              style={{
                backgroundColor: "#fff",
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                marginTop: -25,
                paddingTop: 40,
                marginHorizontal: -H_PADDING,
              }}
            >
              <View className="w-full items-center">
                <Text className="font-extrabold mb-3">챌린지에 도전하면,</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    columnGap: 8,
                  }}
                >
                  <Point width={25} height={25} />
                  <Text
                    className="font-black"
                    style={{ fontSize: 22, transform: [{ translateY: -0.5 }] }}
                  >
                    {totalReward.toLocaleString()} 더 받을 수 있어요!
                  </Text>
                </View>
              </View>

              {/* 필터 영역 */}
              <View className="w-full mt-5 mb-3 items-center">
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
            </View>
          </>
        }
      />
    </View>
  );
}
