import React, { useState, useEffect } from "react";
import { View, Dimensions, Alert, StyleProp, ViewStyle } from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import * as Location from "expo-location";

export default function Map(): JSX.Element {
  const { width, height } = Dimensions.get("window");

  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한이 필요합니다!");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const initialLatLng: LatLng = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(initialLatLng);
      setRouteCoordinates([initialLatLng]);
    })();
  }, []);

  // 이동 경로 시뮬레이션
  useEffect(() => {
    if (!currentLocation) return;

    const exampleRoute: LatLng[] = [
      { latitude: currentLocation.latitude, longitude: currentLocation.longitude },
      { latitude: currentLocation.latitude + 0.0005, longitude: currentLocation.longitude + 0.0005 },
      { latitude: currentLocation.latitude + 0.0010, longitude: currentLocation.longitude + 0.0010 },
      { latitude: currentLocation.latitude + 0.0015, longitude: currentLocation.longitude + 0.0015 },
      { latitude: currentLocation.latitude + 0.0020, longitude: currentLocation.longitude + 0.0020 },
    ];

    let index = 1; // 첫 좌표는 이미 routeCoordinates에 있음
    const interval = setInterval(() => {
      setRouteCoordinates((prev) => {
        if (index >= exampleRoute.length) {
          clearInterval(interval);
          return prev;
        }
        const next = exampleRoute[index];
        index += 1;
        return [...prev, next];
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentLocation]);

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
    <View className="flex-1 justify-center items-center bg-[#101010]">
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
