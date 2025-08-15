import React from "react";
import { View, Button } from "react-native";
import { useNavigate } from "react-router-native";

export default function NavigateButton() {
  const navigate = useNavigate();

  return (
    <View style={{ margin: 10 }}>
      <Button
        title="러닝"
        onPress={() => navigate("/running")}
        color="#4CAF50"
      />
    </View>
  );
}
