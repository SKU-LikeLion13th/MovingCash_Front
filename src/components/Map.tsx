import React, { useState, useEffect, useRef, useMemo, JSX } from "react";
import {
  View,
  Dimensions,
  Alert,
  StyleProp,
  ViewStyle,
  Platform,
} from "react-native";
import MapView, { Marker, Polyline, Region, LatLng } from "react-native-maps";
import { WebView } from "react-native-webview";
import * as Location from "expo-location";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

//구글 키 관련
import Constants from "expo-constants";

const GOOGLE_JS_KEY = (Constants.expoConfig?.extra as any)
  ?.googleMapsKey as string;

export default function Map(): JSX.Element {
  const { width, height } = Dimensions.get("window");

  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startProgressiveDraw = (fullPath: LatLng[], intervalMs = 700) => {
    if (!fullPath || fullPath.length === 0) return;
    if (simRef.current) clearInterval(simRef.current);
    setRouteCoordinates([fullPath[0]]);
    let i = 1;
    simRef.current = setInterval(() => {
      setRouteCoordinates((prev) => {
        if (i >= fullPath.length) {
          if (simRef.current) clearInterval(simRef.current);
          return prev;
        }
        const next = fullPath[i++];
        return [...prev, next];
      });
    }, intervalMs);
  };

  const API_URL = Constants?.expoConfig?.extra?.apiUrl ?? "http://movingcash.sku-sku.com";

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("위치 권한이 필요합니다!");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).catch(() => null);
      if (!loc) return;

      const initialLatLng: LatLng = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCurrentLocation(initialLatLng);

      const todayISO = new Date().toISOString().split("T")[0] + "T00:00:00";
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        setRouteCoordinates([initialLatLng]);
        return;
      }

      try {
        const res = await axios.post(
          `${API_URL}/mainPage`,
          {
            status: "RUNNING",
            startDate: todayISO,
            endDate: todayISO,
            todayDate: todayISO,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token.startsWith("Bearer ")
                ? token
                : `Bearer ${token}`,
            },
            validateStatus: () => true,
          }
        );

        const path: LatLng[] = Array.isArray(res.data?.recentPath)
          ? res.data.recentPath
          : [];
        if (path.length > 1) startProgressiveDraw(path, 700);
        else setRouteCoordinates([initialLatLng]);
      } catch {
        setRouteCoordinates([initialLatLng]);
      }
    })();

    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, []);

  if (!currentLocation) {
    return <View className="flex-1 justify-center items-center bg-[#101010]" />;
  }

  const mapStyle: StyleProp<ViewStyle> = {
    width: width * 0.93,
    height: height * 0.19,
    borderRadius: 10,
    overflow: "hidden",
  };

  const initialRegion: Region = {
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  // Android
  if (Platform.OS === "android") {
    return (
      <View
        className="justify-center items-center bg-[#101010]"
        style={{ flex: 1 }}>
        <GoogleMapsWebView
          style={mapStyle}
          googleKey={GOOGLE_JS_KEY}
          current={currentLocation}
          route={routeCoordinates}
        />
      </View>
    );
  }

  // iOS: 기존 MapView 유지
  return (
    <View className="justify-center items-center bg-[#101010]">
      <MapView
        style={mapStyle}
        provider="google"
        initialRegion={initialRegion}
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled>
        {routeCoordinates.length > 0 && (
          <Marker
            coordinate={routeCoordinates[routeCoordinates.length - 1]}
            title="현재 위치"
          />
        )}
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

/* ===== Android: WebView + Google Maps JS ===== */
function GoogleMapsWebView({
  style,
  googleKey,
  current,
  route,
}: {
  style: any;
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
<style>html,body,#map{height:100%;margin:0;padding:0;background:#101010}</style>
</head>
<body>
<div id="map"></div>
<script>
  let map, marker, poly;
  let lastPayload = null;
  function initMap(){
    map = new google.maps.Map(document.getElementById('map'), {
      center:{lat:37.5665,lng:126.9780}, zoom:15, disableDefaultUI:true
    });
    if(lastPayload) applyPayload(lastPayload);
  }
  function applyPayload(payload){
    const cur = payload.current;
    const route = payload.route || [];
    if(cur){
      const pos = {lat:cur.latitude,lng:cur.longitude};
      if(!marker){ marker=new google.maps.Marker({position:pos,map,title:"현재 위치"}); map.setCenter(pos); map.setZoom(16); }
      else { marker.setPosition(pos); }
    }
    if(Array.isArray(route) && route.length>1){
      const path = route.map(p=>({lat:p.latitude,lng:p.longitude}));
      if(poly){ poly.setPath(path); }
      else {
        poly = new google.maps.Polyline({ map, path, strokeColor:"#E9690D", strokeOpacity:1, strokeWeight:4 });
      }
    }
  }
  function safeParse(d){ try{return JSON.parse(d)}catch(_){return null} }
  function receive(data){
    const payload = safeParse(data); if(!payload) return;
    lastPayload = payload; if(window.google && window.google.maps && map){ applyPayload(payload); }
  }
  document.addEventListener('message',(e)=>receive(e.data));
  window.addEventListener('message',(e)=>receive(e.data));
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
      style={style}
      javaScriptEnabled
      domStorageEnabled
      onMessage={() => {}}
    />
  );
}
