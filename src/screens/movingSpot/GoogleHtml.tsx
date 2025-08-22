// GoogleHtml.ts
export const makeGoogleHtml = (GOOGLE_KEY: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
  <style>
    html, body { height: 100%; margin: 0; padding: 0; }
    #map { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    function post(msg){
      try{
        if(window.ReactNativeWebView){
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }catch(e){}
    }

    let map, currentMarker, accuracyCircle;
    let routePolylines = [];
    let poiMarkers = [];

    // ✅ 로딩 동기화
    let isReady = false;
    const queue = []; // {type:..., ...} 메시지 임시 저장

    // === Styles / Helpers ===
    const BLUE = "#1A73E8";            // 현재 위치 파란 점/원
    const GREEN_ROUTE = "#2BE44A";     // 경로/POI 색상

    function blueDotIcon() {
      // google 준비 전 호출되면 안 되지만, 혹시 대비용 가드
      if (!window.google || !google.maps || !google.maps.SymbolPath) {
        return undefined;
      }
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: BLUE,
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeOpacity: 1,
        strokeWeight: 2,
      };
    }

    const ICON = (color, scale = 10) => {
      if (!window.google || !google.maps || !google.maps.SymbolPath) {
        return undefined;
      }
      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeOpacity: 1,
        strokeWeight: 2,
      };
    };

    function initMap(){
      try{
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 15,
          disableDefaultUI: true
        });
        isReady = true;
        post({ type: "READY" });
        flushQueue(); // 🔄 대기중인 메시지 처리
      }catch(e){
        post({ type: "ERROR", msg: e && e.message ? e.message : String(e) });
      }
    }

    function flushQueue(){
      while(queue.length){
        const msg = queue.shift();
        safeHandleMessage(msg);
      }
    }

    // ===== 현재 위치 =====
    function setCurrent(lat, lng, accuracy, follow){
      try{
        if (!isReady || !window.google || !map) return; // 가드
        const pos = { lat, lng };

        if(!currentMarker){
          currentMarker = new google.maps.Marker({
            position: pos,
            map,
            title: "현재 위치",
            icon: blueDotIcon(),
            clickable: false,
            zIndex: 1000,
            optimized: true,
          });
        } else {
          currentMarker.setPosition(pos);
          currentMarker.setIcon(blueDotIcon());
        }

        if(accuracy != null){
          const radius = Math.max(5, Number(accuracy));
          if(!accuracyCircle){
            accuracyCircle = new google.maps.Circle({
              map, center: pos, radius,
              fillColor: BLUE,
              fillOpacity: 0.15,
              strokeColor: BLUE,
              strokeOpacity: 0.4,
              strokeWeight: 1,
              clickable: false,
              zIndex: 999,
            });
          } else {
            accuracyCircle.setCenter(pos);
            accuracyCircle.setRadius(radius);
          }
        }

        if(follow){ map.panTo(pos); }
      }catch(e){
        post({ type: "ERROR", msg: "SET_CURRENT failed: " + (e?.message || String(e)) });
      }
    }

    function moveCamera(lat, lng, zoom){
      try{
        if (!isReady || !window.google || !map) return;
        map.setZoom(zoom || 14);
        map.panTo({ lat, lng });
      }catch(e){
        post({ type: "ERROR", msg: "MOVE_CAMERA failed: " + (e?.message || String(e)) });
      }
    }

    // ===== POIs (S / 1..n / D) =====
    function clearPOIs(){
      poiMarkers.forEach(m => m.setMap(null));
      poiMarkers = [];
    }
    function drawPOIs(origin, destination, waypoints){
      if (!isReady || !window.google || !map) return;
      clearPOIs();
      // Start
      poiMarkers.push(new google.maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map,
        icon: ICON(GREEN_ROUTE, 11),
        label: { text: "S", color: "#FFFFFF", fontWeight: "700" },
        title: origin.name || "출발지",
      }));
      // Waypoints
      (waypoints || []).forEach((w, i) => {
        poiMarkers.push(new google.maps.Marker({
          position: { lat: w.lat, lng: w.lng },
          map,
          icon: ICON(GREEN_ROUTE, 10),
        label: { text: String(i+1), color: "#FFFFFF", fontWeight: "700" },
          title: w.name || ("경유지 " + (i+1)),
        }));
      });
      // Destination
      poiMarkers.push(new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map,
        icon: ICON(GREEN_ROUTE, 11),
        label: { text: "D", color: "#FFFFFF", fontWeight: "700" },
        title: destination.name || "도착지",
      }));
    }

    // ===== 경로 라인 =====
    function clearRoutes(){
      routePolylines.forEach(pl => pl.setMap(null));
      routePolylines = [];
    }

    function drawRouteSingle(latlngs){
      if (!isReady || !window.google || !map) return;
      clearRoutes();
      const poly = new google.maps.Polyline({
        path: latlngs,
        map,
        strokeWeight: 4,              // 얇게
        strokeOpacity: 1,
        strokeColor: GREEN_ROUTE,     // #2BE44A
        clickable: false,
      });
      routePolylines.push(poly);

      const bounds = new google.maps.LatLngBounds();
      latlngs.forEach(p => bounds.extend(p));
      poiMarkers.forEach(m => bounds.extend(m.getPosition()));
      map.fitBounds(bounds);
    }

    // 🔁 폴백: 출발→경유→도착을 직선으로 이어서 그리기
    function drawStraightRoute(points){
      if(!Array.isArray(points) || points.length < 2) return;
      if (!isReady || !window.google || !map) return;

      const origin = points[0];
      const destination = points[points.length - 1];
      const waypoints = points.slice(1, -1);
      drawPOIs(origin, destination, waypoints);

      clearRoutes();
      const poly = new google.maps.Polyline({
        path: points.map(p => ({ lat: p.lat, lng: p.lng })),
        map,
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeColor: GREEN_ROUTE,
        clickable: false,
      });
      routePolylines.push(poly);

      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend(new google.maps.LatLng(p.lat, p.lng)));
      poiMarkers.forEach(m => bounds.extend(m.getPosition()));
      map.fitBounds(bounds);
    }

    // ===== 메시지 처리기 =====
    function safeHandleMessage(msg){
      // google 준비 안 됐으면 큐에 보관
      if (!isReady || !window.google || !map) {
        queue.push(msg);
        return;
      }
      if(!msg || typeof msg !== "object") return;

      if(msg.type === "SET_CURRENT"){
        setCurrent(msg.lat, msg.lng, msg.accuracy, !!msg.follow);
      } else if(msg.type === "MOVE_CAMERA"){
        moveCamera(msg.lat, msg.lng, msg.zoom);
      } else if(msg.type === "DRAW_ROUTE"){
        drawPOIs(msg.origin, msg.destination, msg.waypoints || []);
        drawRouteSingle(msg.latlngs || []);
      } else if(msg.type === "DRAW_POIS_ONLY"){
        drawPOIs(msg.origin, msg.destination, msg.waypoints || []);
      } else if(msg.type === "DRAW_STRAIGHT"){
        drawStraightRoute(msg.points || []);
      }
    }

    // ===== RN <-> WebView 브리지 =====
    window.addEventListener("message", function(ev){
      try{
        const msg = JSON.parse(ev.data);
        safeHandleMessage(msg);
      }catch(e){
        post({ type: "ERROR", msg: "message parse failed: " + (e?.message || String(e)) });
      }
    });

    // iOS 일부 환경 대응
    document.addEventListener("message", function(ev){
      if(ev?.data) {
        try {
          const msg = JSON.parse(ev.data);
          safeHandleMessage(msg);
        } catch(e) {
          post({ type: "ERROR", msg: "message parse failed: " + (e?.message || String(e)) });
        }
      }
    });
  </script>

  <script async
    src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=geometry&callback=initMap">
  </script>
</body>
</html>
`;
