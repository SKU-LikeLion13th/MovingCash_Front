import React, { useState, useEffect, JSX, useRef, useMemo } from "react";
import { View, Dimensions, Alert, StyleProp, ViewStyle, Platform } from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";

import Constants from "expo-constants";

const GOOGLE_JS_KEY = (Constants.expoConfig?.extra as any)
  ?.googleMapsKey as string;

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

      const location = await Location.getCurrentPositionAsync({}).catch(() => null);
      if (!location) return;

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
        (loc) => {
          const newLatLng: LatLng = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
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
    overflow: "hidden", // WebView도 반경 잘리게
  };

  const region: Region = {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  // ✅ Android: 빌드 없이 WebView + Google Maps JS로 표기
  if (Platform.OS === "android") {
    return (
      <View className="justify-center items-center bg-[#101010]">
        <View style={mapStyle}>
          <GoogleMapsWebView
            googleKey={GOOGLE_JS_KEY}
            current={currentLocation}
            route={routeCoordinates}
          />
        </View>
      </View>
    );
  }

  // ✅ iOS: 기존 MapView 그대로
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
          <Polyline coordinates={routeCoordinates} strokeColor="#E9690D" strokeWidth={3} />
        )}
      </MapView>
    </View>
  );
}

/* ---------------- Android 전용: WebView + Google Maps JavaScript API ---------------- */
function GoogleMapsWebView({
  googleKey,
  current,
  route,
}: {
  googleKey: string;
  current: LatLng | null;
  route: LatLng[];
}) {
  const ref = useRef<WebView>(null);

  const html = useMemo(
    () => `
<!doctype html>
<html>
<head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:#101010}
</style>
</head>
<body>
<div id="map"></div>
<script>
  let map, marker, poly;

  function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat:37.5665, lng:126.9780},
      zoom: 15,
      disableDefaultUI: true
    });
  }

  function applyPayload(payload){
    const cur = payload.current;
    const rt = payload.route || [];
    if(cur){
      const pos = {lat: cur.latitude, lng: cur.longitude};
      if(!marker){
        marker = new google.maps.Marker({ position: pos, map, title: "현재 위치" });
        map.setCenter(pos);
        map.setZoom(16);
      } else {
        marker.setPosition(pos);
      }
    }
    if(Array.isArray(rt) && rt.length > 1){
      const path = rt.map(p=>({lat:p.latitude, lng:p.longitude}));
      if(poly){ poly.setPath(path); }
      else {
        poly = new google.maps.Polyline({
          map,
          path,
          strokeColor: "#E9690D",
          strokeOpacity: 1,
          strokeWeight: 4
        });
      }
    }
  }

  function safeParse(d){ try{return JSON.parse(d)}catch(_){return null} }
  function receive(data){ const p=safeParse(data); if(!p || !map) return; applyPayload(p); }

  document.addEventListener('message', (e)=> receive(e.data));
  window.addEventListener('message', (e)=> receive(e.data));
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${googleKey}&callback=initMap" async defer></script>
</body>
</html>`,
    [googleKey]
  );

  useEffect(() => {
    const payload = JSON.stringify({ current, route });
    const js = `window.postMessage('${payload}', '*'); true;`;
    ref.current?.injectJavaScript(js);
  }, [current, route]);

  return (
    <WebView
      ref={ref}
      originWhitelist={["*"]}
      source={{ html }}
      style={{ width: "100%", height: "100%" }}
      javaScriptEnabled
      domStorageEnabled
      onMessage={() => {}}
    />
  );
}
