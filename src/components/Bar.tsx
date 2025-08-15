import { View, Text, TouchableOpacity } from "react-native";
import { useLocation, useNavigate } from "react-router-native";

import HomeIcon from "../../assets/icons/mainBtn.svg";
import StoreIcon from "../../assets/icons/shopBtn.svg";
import PointIcon from "../../assets/icons/pointBtn.svg";
import UserIcon from "../../assets/icons/mypageBtn.svg";

const tabs = [
  { to: "/", label: "메인", Icon: HomeIcon, type: "fill" },
  { to: "/store", label: "상점", Icon: StoreIcon, type: "fill" },
  { to: "/point", label: "포인트", Icon: PointIcon, type: "stroke" },
  { to: "/mypage", label: "마이페이지", Icon: UserIcon, type: "stroke" },
];

export default function Bar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <View className="flex-row justify-around py-[30px] text-center bg-[#101010]">
      {tabs.map(({ to, label, Icon, type }) => {
        const isActive = location.pathname === to;
        const color = isActive ? "#E9690D" : "#999999"; 

        return (
          <TouchableOpacity
            key={to}
            onPress={() => navigate(to)}
          >
            <View className="items-center w-13">
              {type === "stroke" ? (
                <Icon
                  stroke={color}
                  fill="none"
                />
              ) : (
                <Icon fill={color} />
              )}
              <Text style={{ color, fontSize: 12, marginTop: 3 }}>{label}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
