export const makeGoogleHtml = (GOOGLE_KEY: string) => String.raw`
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
    // ===== RN <-> WebView Bridge =====
    function post(msg){
      try{
        if(window.ReactNativeWebView){
          window.ReactNativeWebView.postMessage(JSON.stringify(msg));
        }
      }catch(e){}
    }

    let map, currentMarker, accuracyCircle;
    let routePolylines = [];
    let poiMarkers = [];       // 경로용 (S/1..n/D)
    let searchMarkers = [];    // 검색 결과용

    // 로딩 동기화
    let isReady = false;
    const queue = []; // {type:..., ...}

    // ===== Styles / Helpers =====
    const BLUE = "#1A73E8";            // 현재 위치 파란 점/원
    const GREEN_ROUTE = "#2BE44A";     // 경로/POI 색상

    function blueDotIcon() {
      if (!window.google || !google.maps || !google.maps.SymbolPath) return undefined;
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
      if (!window.google || !google.maps || !google.maps.SymbolPath) return undefined;
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

    // ===== Map Init =====
    function initMap(){
      const MAP_STYLE = [
        { featureType: "poi", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      ];
      try{
        map = new google.maps.Map(document.getElementById('map'), {
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 15,
          disableDefaultUI: true,
          clickableIcons: false,
          styles: MAP_STYLE
        });
        isReady = true;
        post({ type: "READY" });
        flushQueue();
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
        if (!isReady || !window.google || !map) return;
        const pos = { lat: Number(lat), lng: Number(lng) };
        if(!Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) return;

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
        const z = Number(zoom) || 14;
        const pos = { lat: Number(lat), lng: Number(lng) };
        if(!Number.isFinite(pos.lat) || !Number.isFinite(pos.lng)) return;
        map.setZoom(z);
        map.panTo(pos);
      }catch(e){
        post({ type: "ERROR", msg: "MOVE_CAMERA failed: " + (e?.message || String(e)) });
      }
    }

    // ===== 경로용 POIs (S / 1..n / D) =====
    function clearPOIs(){
      poiMarkers.forEach(m => m.setMap(null));
      poiMarkers = [];
    }
    function drawPOIs(origin, destination, waypoints){
      if (!isReady || !window.google || !map) return;
      clearPOIs();
      try{
        // Start
        poiMarkers.push(new google.maps.Marker({
          position: { lat: Number(origin.lat), lng: Number(origin.lng) },
          map,
          icon: ICON(GREEN_ROUTE, 11),
          label: { text: "S", color: "#FFFFFF", fontWeight: "700" },
          title: origin.name || "출발지",
        }));
        // Waypoints
        (waypoints || []).forEach((w, i) => {
          poiMarkers.push(new google.maps.Marker({
            position: { lat: Number(w.lat), lng: Number(w.lng) },
            map,
            icon: ICON(GREEN_ROUTE, 10),
            label: { text: String(i+1), color: "#FFFFFF", fontWeight: "700" },
            title: w.name || ("경유지 " + (i+1)),
          }));
        });
        // Destination
        poiMarkers.push(new google.maps.Marker({
          position: { lat: Number(destination.lat), lng: Number(destination.lng) },
          map,
          icon: ICON(GREEN_ROUTE, 11),
          label: { text: "D", color: "#FFFFFF", fontWeight: "700" },
          title: destination.name || "도착지",
        }));
      }catch(e){}
    }

    // ===== 경로 라인 =====
    function clearRoutes(){
      routePolylines.forEach(pl => pl.setMap(null));
      routePolylines = [];
    }

    function drawRouteSingle(latlngs){
      if (!isReady || !window.google || !map) return;
      clearRoutes();
      const pts = (latlngs || [])
        .map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      if(!pts.length) return;

      const poly = new google.maps.Polyline({
        path: pts,
        map,
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeColor: GREEN_ROUTE,
        clickable: false,
      });
      routePolylines.push(poly);

      const bounds = new google.maps.LatLngBounds();
      pts.forEach(p => bounds.extend(p));
      poiMarkers.forEach(m => bounds.extend(m.getPosition()));
      if (!bounds.isEmpty()) map.fitBounds(bounds);
    }

    // 🔁 폴백: 출발→경유→도착 직선
    function drawStraightRoute(points){
      if(!Array.isArray(points) || points.length < 2) return;
      if (!isReady || !window.google || !map) return;

      const origin = points[0];
      const destination = points[points.length - 1];
      const waypoints = points.slice(1, -1);
      drawPOIs(origin, destination, waypoints);

      clearRoutes();
      const pts = points
        .map(p => ({ lat: Number(p.lat), lng: Number(p.lng) }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      if(!pts.length) return;

      const poly = new google.maps.Polyline({
        path: pts,
        map,
        strokeWeight: 4,
        strokeOpacity: 1,
        strokeColor: GREEN_ROUTE,
        clickable: false,
      });
      routePolylines.push(poly);

      const bounds = new google.maps.LatLngBounds();
      pts.forEach(p => bounds.extend(p));
      poiMarkers.forEach(m => bounds.extend(m.getPosition()));
      if (!bounds.isEmpty()) map.fitBounds(bounds);
    }

    // ===== 검색 결과 마커 =====
    function clearSearchMarkers(){
      searchMarkers.forEach(m => m.setMap(null));
      searchMarkers = [];
    }

    function setSearchMarkers(list, fit){
      if (!isReady || !window.google || !map) return;
      clearSearchMarkers();

      const safe = (list || [])
        .map(item => ({
          lat: Number(item.lat),
          lng: Number(item.lng),
          title: item.title || "",
          subtitle: item.subtitle || "",
        }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

      if (!safe.length) return;

      const bounds = new google.maps.LatLngBounds();

      const seen = new Map(); // "lat,lng" -> count
      const jitter = (v) => v + (Math.random() - 0.5) * 0.00015;

      safe.forEach(item => {
        const key = item.lat.toFixed(6) + "," + item.lng.toFixed(6);
        const count = (seen.get(key) || 0) + 1;
        seen.set(key, count);

        let lat = item.lat;
        let lng = item.lng;
        if (count > 1) { // 같은 좌표가 2개 이상이면 살짝 흩뿌리기
          lat = jitter(lat);
          lng = jitter(lng);
        }

        const pos = { lat, lng };

        const marker = new google.maps.Marker({
          position: pos,
          map,
          title: item.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 15,
            fillColor: "#586271",
            fillOpacity: 1,
          },
          label: item.emoji ? { text: String(item.emoji) } : undefined,
          zIndex: 500,
        });

        if (item.subtitle || item.title) {
          const iw = new google.maps.InfoWindow({
            content: '<div style="font-size:12px;line-height:1.4;">' +
                      (item.title ? ('<b>' + escapeHtml(item.title) + '</b><br/>') : '') +
                      (item.subtitle ? escapeHtml(item.subtitle) : '') +
                    '</div>'
          });
          marker.addListener('click', () => iw.open({ anchor: marker, map }));
        }

        searchMarkers.push(marker);
        bounds.extend(pos);
      });

      // 화면 맞추기
      if (fit) {
        if (safe.length === 1) {
          map.setZoom(17);
          map.panTo({ lat: safe[0].lat, lng: safe[0].lng });
        } else if (!bounds.isEmpty()) {
          map.fitBounds(bounds);
          google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
            if (map.getZoom() > 18) map.setZoom(18);
          });
        }
      }
    }

    function escapeHtml(s){
      return String(s).replace(/[&<>"']/g, function(m){
        return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'}[m]);
      });
    }

    // ===== 메시지 처리기 =====
    function safeHandleMessage(msg){
      if (!isReady || !window.google || !map) {
        queue.push(msg);
        return;
      }
      if(!msg || typeof msg !== "object") return;

      switch(msg.type){
        case "SET_CURRENT":
          setCurrent(msg.lat, msg.lng, msg.accuracy, !!msg.follow);
          break;
        case "MOVE_CAMERA":
          moveCamera(msg.lat, msg.lng, msg.zoom);
          break;
        case "DRAW_ROUTE":
          drawPOIs(msg.origin, msg.destination, msg.waypoints || []);
          drawRouteSingle(msg.latlngs || []);
          break;
        case "DRAW_POIS_ONLY":
          drawPOIs(msg.origin, msg.destination, msg.waypoints || []);
          break;
        case "DRAW_STRAIGHT":
          drawStraightRoute(msg.points || []);
          break;
        case "SET_MARKERS":
          setSearchMarkers(msg.markers || [], !!msg.fit);
          break;
        case "CLEAR_MARKERS":
          clearSearchMarkers();
          break;
        default:
          // no-op
      }
    }

    // RN → WebView
    window.addEventListener("message", function(ev){
      try{
        const msg = JSON.parse(ev.data);
        safeHandleMessage(msg);
      }catch(e){
        post({ type: "ERROR", msg: "message parse failed: " + (e?.message || String(e)) });
      }
    });

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

  <script async defer src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=geometry&callback=initMap"></script>
</body>
</html>`;
