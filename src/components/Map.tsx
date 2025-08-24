import React, { useState, useEffect, JSX } from "react";
import { View, Dimensions, Alert, StyleProp, ViewStyle } from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Map(): JSX.Element {
  const { width, height } = Dimensions.get("window");

  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);

  useEffect(() => {
    (async () => {
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한이 필요합니다!");
        return;
      }

      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({});
      const initialLatLng: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(initialLatLng);

      const today = new Date();
      const todayISO = today.toISOString().split("T")[0] + "T00:00:00";

      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        console.warn("토큰이 없습니다. 로그인 필요!");
        return;
      }

      try {
        const response = await axios.post(
          "http://movingcash.sku-sku.com/mainPage",
          {
            status: "RUNNING",
            startDate: todayISO,
            endDate: todayISO,
            todayDate: todayISO,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
          }
        );

        const path: LatLng[] = response.data.recentPath || [];
        if (path.length > 0) {
          setRouteCoordinates(path);
        } else {
          setRouteCoordinates([initialLatLng]); // fallback
        }
      } catch (err) {
        console.error(err);
        Alert.alert("최근 이동 경로를 불러오는데 실패했습니다.");
        setRouteCoordinates([initialLatLng]);
      }
    })();
  }, []);

  if (!currentLocation) {
    return <View className="flex-1 justify-center items-center bg-[#101010]" />;
  }

  const mapStyle: StyleProp<ViewStyle> = {
    width: width * 0.93,
    height: height * 0.19,
    borderRadius: 10,
  };

  const initialRegion: Region = {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  return (
    <View className="justify-center items-center bg-[#101010]">
      <MapView
        style={mapStyle}
        provider="google"
        initialRegion={initialRegion}
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled
      >
        {/* 현재 위치 마커 */}
        {routeCoordinates.length > 0 && (
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            title="현재 위치"
          />
        )}

        {/* 이동 경로 Polyline */}
        <Polyline
          key={routeCoordinates.length}
          coordinates={routeCoordinates}
          strokeColor="#E9690D"
          strokeWidth={3}
        />
      </MapView>
    </View>
  );
}
