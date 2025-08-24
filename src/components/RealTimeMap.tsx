import React, { useState, useEffect, JSX } from "react";
import { View, Dimensions, Alert, StyleProp, ViewStyle } from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import * as Location from "expo-location";

export default function RealTimeMap(): JSX.Element {
  const { width, height } = Dimensions.get("window");

  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);

  useEffect(() => {
    let subscriber: Location.LocationSubscription | null = null;

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

      subscriber = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 1,
        },
        (location) => {
          const newLatLng: LatLng = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setCurrentLocation(newLatLng);
          setRouteCoordinates((prev) => [...prev, newLatLng]);
        }
      );
    })();

    return () => subscriber?.remove();
  }, []);

  if (!currentLocation) {
    return <View className="flex-1 justify-center items-center bg-[#101010]" />;
  }

  const mapStyle: StyleProp<ViewStyle> = {
    width: width * 0.93,
    height: height * 0.19,
    borderRadius: 10,
  };

  const region: Region = {
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
        region={region}
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled
      >
        <Marker coordinate={currentLocation} title="현재 위치" />

        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#E9690D"
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
}
