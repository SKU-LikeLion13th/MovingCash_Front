export const makeGoogleHtml = (BROWSER_KEY: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
  <style>
    html, body, #map { height: 100%; margin:0; padding:0; }
    .label { background:#fff; border-radius:8px; padding:4px 8px; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    let map, markers=[], routeLine=null, directionsService, directionsRenderer;
    let currentMarker=null, accuracyCircle=null;

    function post(msg){
      if(window.ReactNativeWebView){
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    }

    function initMap(){
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:37.5665, lng:126.9780}, zoom:14, disableDefaultUI:true
      });
      directionsService = new google.maps.DirectionsService();
      directionsRenderer = new google.maps.DirectionsRenderer({ map });

      document.addEventListener('message', onRNMessage);
      post({ type:'READY' });
    }

    function onRNMessage(ev){
      let data={}; try{ data = JSON.parse(ev.data); }catch(e){}
      if(!data || !data.type) return;

      switch(data.type){
        case 'MOVE_CAMERA': return moveCamera(data.lat, data.lng, data.zoom);
        case 'SET_MARKERS': return setMarkers(data.items||[]);
        case 'DRAW_ROUTE_POINTS': return drawRouteFromPoints(data.points||[]);
        case 'DRAW_ROUTE_POLYLINE': return drawPolylineEncoded(data.polyline);
        case 'SET_CURRENT': return setCurrent(data.lat, data.lng, data.accuracy, data.follow);
        case 'FIND_DIRECTIONS': return findDirections(data); 
      }
    }

    function clearMarkers(){ markers.forEach(m=>m.setMap(null)); markers=[]; }
    function setMarkers(items){
      clearMarkers();
      items.forEach(it=>{
        const lat = it.lat ?? it.latitude;
        const lng = it.lng ?? it.longitude;
        if(lat == null || lng == null) return;

        const pos = new google.maps.LatLng(lat, lng);
        const marker = new google.maps.Marker({ position: pos, map });
        if(it.title){
          const iw = new google.maps.InfoWindow({ content: '<div class="label">'+it.title+'</div>' });
          marker.addListener('click', ()=> iw.open({ anchor:marker, map }));
        }
        markers.push(marker);
      });
    }

    function moveCamera(lat,lng,zoom){ map.setZoom(zoom||16); map.setCenter({lat,lng}); }

    function setCurrent(lat, lng, accuracy, follow){
      const pos = new google.maps.LatLng(lat, lng);

      // 파란 점 스타일 마커
      if(!currentMarker){
        currentMarker = new google.maps.Marker({
          map, position: pos, zIndex: 999,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 6,
            fillColor: '#4285F4', fillOpacity: 1,
            strokeColor: '#fff', strokeWeight: 2
          }
        });
      } else {
        currentMarker.setPosition(pos);
      }

      // 정확도(반경) 원
      if(accuracy){
        if(!accuracyCircle){
          accuracyCircle = new google.maps.Circle({
            map, center: pos, radius: accuracy,
            fillColor: '#4285F4', fillOpacity: 0.15,
            strokeOpacity: 0
          });
        } else {
          accuracyCircle.setCenter(pos);
          accuracyCircle.setRadius(accuracy);
        }
      }

      if(follow) moveCamera(lat, lng, 17);
    }

    function drawRouteFromPoints(points){
      if(routeLine) routeLine.setMap(null);
      const path = points.map(p=>({lat:p.lat, lng:p.lng}));
      routeLine = new google.maps.Polyline({
        map, path, strokeOpacity:0.9, strokeWeight:5, strokeColor:'#19C37D'
      });
      const b = new google.maps.LatLngBounds(); path.forEach(p=>b.extend(p)); map.fitBounds(b);
    }

    function drawPolylineEncoded(encoded){
      const path = google.maps.geometry.encoding.decodePath(encoded);
      if(routeLine) routeLine.setMap(null);
      routeLine = new google.maps.Polyline({
        map, path, strokeOpacity:0.9, strokeWeight:5, strokeColor:'#19C37D'
      });
      const b = new google.maps.LatLngBounds(); path.forEach(p=>b.extend(p)); map.fitBounds(b);
    }

    // ★ 최단 경로 계산 후 초록색 라인으로 표시
    function findDirections(data){
      console.log("FIND_DIRECTIONS received data:", data);
      if(!data || !data.origin || !data.destination) return;

      const origin = new google.maps.LatLng(
        data.origin.lat ?? data.origin.latitude,
        data.origin.lng ?? data.origin.longitude
      );
      const destination = new google.maps.LatLng(
        data.destination.lat ?? data.destination.latitude,
        data.destination.lng ?? data.destination.longitude
      );
      const waypoints = (data.waypoints||[]).map(w => ({
        location: new google.maps.LatLng(
          w.lat ?? w.latitude,
          w.lng ?? w.longitude
        ),
        stopover: true
      }));

      const req = {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: (data.mode || 'WALKING'),
        provideRouteAlternatives: false
      };

      directionsService.route(req, (res, status) => {
        if (status !== 'OK' || !res || !res.routes || !res.routes[0]) {
          post({ type: 'ERROR', msg: 'Directions failed', status, error_message: res && res.error_message });
          return;
        }
        const r = res.routes[0];
        const path = r.overview_path;

        if(routeLine) routeLine.setMap(null);
        routeLine = new google.maps.Polyline({
          map,
          path,
          strokeOpacity: 0.95,
          strokeWeight: 6,
          strokeColor: '#19C37D' // 초록색
        });

        // bounds 맞추기
        const b = new google.maps.LatLngBounds();
        path.forEach(p => b.extend(p));
        map.fitBounds(b);
      });
    }

    window.onerror = function(msg, src, line, col, err){
      post({ type:'ERROR', msg, src, line, col, stack: err && err.stack });
    }
    window.initMap = initMap;
  </script>

  <!-- geometry 라이브러리 포함(폴리라인 디코딩용) -->
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&callback=initMap&libraries=geometry">
  </script>
</body>
</html>

    window.onerror = function(msg, src, line, col, err){
      post({ type:'ERROR', msg, src, line, col, stack: err && err.stack });
    }
    window.initMap = initMap;
  </script>

  <!-- geometry 라이브러리 포함(폴리라인 디코딩용) -->
  <script async defer
    src="https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&callback=initMap&libraries=geometry">
  </script>
</body>
</html>
`;
