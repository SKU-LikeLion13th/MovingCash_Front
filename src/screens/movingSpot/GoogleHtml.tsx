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

    function initMap(){
      try{
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 15,
          disableDefaultUI: true
        });
        post({ type: "READY" });
      }catch(e){
        post({ type: "ERROR", msg: e && e.message ? e.message : String(e) });
      }
    }

    // ===== 현재 위치 =====
    function setCurrent(lat, lng, accuracy, follow){
      try{
        const pos = { lat, lng };

        if(!currentMarker){
          currentMarker = new google.maps.Marker({
            position: pos,
            map,
            title: "현재 위치",
          });
        } else {
          currentMarker.setPosition(pos);
        }

        if(accuracy != null){
          const radius = Math.max(5, Number(accuracy));
          if(!accuracyCircle){
            accuracyCircle = new google.maps.Circle({
              map, center: pos, radius,
              fillOpacity: 0.1, strokeOpacity: 0.2
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
      clearPOIs();
      // Start
      poiMarkers.push(new google.maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map, label: { text: "S", fontWeight: "700" },
        title: origin.name || "출발지",
      }));
      // Waypoints
      (waypoints || []).forEach((w, i) => {
        poiMarkers.push(new google.maps.Marker({
          position: { lat: w.lat, lng: w.lng },
          map, label: { text: String(i+1), fontWeight: "700" },
          title: w.name || ("경유지 " + (i+1)),
        }));
      });
      // Destination
      poiMarkers.push(new google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map, label: { text: "D", fontWeight: "700" },
        title: destination.name || "도착지",
      }));
    }

    // ===== 경로 라인 =====
    function clearRoutes(){
      routePolylines.forEach(pl => pl.setMap(null));
      routePolylines = [];
    }

    function drawRouteSingle(latlngs){
      clearRoutes();
      const poly = new google.maps.Polyline({
        path: latlngs,
        map,
        strokeWeight: 6,
        strokeOpacity: 0.95
        // strokeColor: "#19C37D",
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

      const origin = points[0];
      const destination = points[points.length - 1];
      const waypoints = points.slice(1, -1);
      drawPOIs(origin, destination, waypoints);

      clearRoutes();
      const poly = new google.maps.Polyline({
        path: points.map(p => ({ lat: p.lat, lng: p.lng })),
        map,
        strokeWeight: 6,
        strokeOpacity: 0.95
        // strokeColor: "#19C37D",
      });
      routePolylines.push(poly);

      const bounds = new google.maps.LatLngBounds();
      points.forEach(p => bounds.extend(new google.maps.LatLng(p.lat, p.lng)));
      poiMarkers.forEach(m => bounds.extend(m.getPosition()));
      map.fitBounds(bounds);
    }

    // ===== RN <-> WebView 브리지 =====
    window.addEventListener("message", function(ev){
      try{
        const msg = JSON.parse(ev.data);
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
      }catch(e){
        post({ type: "ERROR", msg: "message parse failed: " + (e?.message || String(e)) });
      }
    });

    // iOS 일부 환경 대응
    document.addEventListener("message", function(ev){
      if(ev?.data) window.dispatchEvent(new MessageEvent("message", { data: ev.data }));
    });
  </script>

  <script async
    src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=geometry&callback=initMap">
  </script>
</body>
</html>
`;
