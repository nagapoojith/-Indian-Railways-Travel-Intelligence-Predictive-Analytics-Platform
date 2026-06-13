import { useEffect, useRef } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

// Helper to clean station names for precise geocoding in India
const cleanStationName = (name) => {
  if (!name) return "";
  
  // Split at '-' to ignore zone/code suffixes, strip parenthetical text and dots
  let cleanName = name.split("-")[0]
    .replace(/\(.*?\)/g, "")
    .replace(/\./g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
  
  // Specific spelling corrections for known deviations in dataset station names
  const corrections = {
    "THRISUR": "THRISSUR",
    "TRIVANDRUM CNTL": "TRIVANDRUM CENTRAL",
    "CHANGANASERI": "CHANGANASSERY",
    "TIRUVALLA": "THIRUVALLA",
    "MAVELIKARA": "MAVELIKKARA",
    "JOLARPETTAI": "JOLARPET",
    "SIRPURKAGHAZ": "SIRPUR KAGHAZNAGAR",
    "SEWAGRAM": "SEVAGRAM",
    "DHAULPUR": "DHOLPUR",
    "HABIBGANJ": "HABIBGANJ BHOPAL",
    "CHENNAI CENT": "CHENNAI CENTRAL",
    "VIJAYWADA JN": "VIJAYAWADA JUNCTION",
    "AMLA JN": "AMLA JUNCTION",
    "GUDUR JN": "GUDUR JUNCTION",
    "TENALI JN": "TENALI JUNCTION",
    "DELHI-SARAI": "SARAI ROHILLA",
    "BAPATIA": "BAPATLA",
  };
  
  if (corrections[cleanName]) {
    cleanName = corrections[cleanName];
  }
  
  for (const [key, replacement] of Object.entries(corrections)) {
    if (cleanName.includes(key)) {
      cleanName = cleanName.replace(key, replacement);
      break;
    }
  }
  
  return cleanName;
};

// Geocode with localStorage cache and automatic fallback/retry logic
const geocodeStation = async (stationName) => {
  if (!stationName || stationName === "Destination Reached" || stationName === "N/A") return null;
  
  const cacheKey = `geocode_v3_${stationName.toUpperCase().trim()}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      // Ignore parse errors
    }
  }

  const cleaned = cleanStationName(stationName);
  
  // Generate candidate queries to try sequentially
  const candidates = [];
  const noSuffix = cleaned.replace(/\b(JN|JUNCTION|CENTRAL|TOWN|TERMINUS|TERM|HB|PH)\b/gi, "").trim();
  
  candidates.push(`${cleaned}, India`);
  candidates.push(`${cleaned} Station, India`);
  if (noSuffix !== cleaned) {
    candidates.push(`${noSuffix} Junction, India`);
    candidates.push(`${noSuffix}, India`);
    candidates.push(`${noSuffix} Station, India`);
  }
  candidates.push(`${cleaned} Railway Station, India`);
  
  // Deduplicate candidates
  const uniqueCandidates = Array.from(new Set(candidates));

  for (const query of uniqueCandidates) {
    try {
      const response = await fetch(
        `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
          query
        )}.json?key=RawLr6biXwCEZS2807iIDyGLaVkA9s9B&countrySet=IN&limit=1`
      );
      const data = await response.json();
      if (data && data.results && data.results.length > 0) {
        const { lat, lon } = data.results[0].position;
        const address = data.results[0].address?.freeformAddress || "";
        
        // Detect generic/bogus fallbacks:
        // 1. Sikkim/Bhutan border area (approx 27.0010 N, 88.4355 E)
        const isSikkimFallback = Math.abs(lat - 27.0010) < 0.01 && Math.abs(lon - 88.4355) < 0.01;
        // 2. Bhimavaram Junction Road area (approx 16.5449 N, 81.5333 E)
        const isBhimavaramFallback = Math.abs(lat - 16.5449) < 0.01 && Math.abs(lon - 81.5333) < 0.01;
        // 3. Address explicitly names the fallback station
        const isRiayang = address.toUpperCase().includes("RIAYANG");
        
        if (isSikkimFallback || isBhimavaramFallback || isRiayang) {
          console.warn(`Geocoding fallback detected for "${stationName}" with query "${query}". Retrying next candidate...`);
          continue;
        }
        
        const coords = [lon, lat]; // TomTom expects [lng, lat]
        localStorage.setItem(cacheKey, JSON.stringify(coords));
        return coords;
      }
    } catch (error) {
      console.error(`Error geocoding "${stationName}" using query "${query}":`, error);
    }
  }
  
  return null;
};

export default function TrainMap({ currentStation, nextStation, destination, routeStations = [] }) {
  const mapElement = useRef();

  useEffect(() => {
    let mapInstance = null;
    let isMounted = true;

    const loadRouteAndInitMap = async () => {
      // Build stations list to geocode
      const stationsList = routeStations && routeStations.length > 0
        ? routeStations
        : [currentStation, nextStation, destination].filter(Boolean);

      // Geocode sequentially to avoid rate limiting
      const geocodedStations = [];
      for (const stationName of stationsList) {
        if (!isMounted) return;
        const coords = await geocodeStation(stationName);
        if (coords) {
          geocodedStations.push({ name: stationName, coords });
        }
        // Small delay to prevent API overloading on first-time cache misses
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      if (!isMounted || !mapElement.current) return;

      // Filter out geocoding spike outliers to ensure route is accurate
      let filteredStations = [...geocodedStations];
      if (geocodedStations.length > 2) {
        const dist = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
        
        filteredStations = geocodedStations.filter((pt, index) => {
          if (index === 0 || index === geocodedStations.length - 1) {
            return true; // Keep source and destination
          }
          
          const prev = geocodedStations[index - 1].coords;
          const next = geocodedStations[index + 1].coords;
          const curr = pt.coords;
          
          const dPrev = dist(curr, prev);
          const dNext = dist(curr, next);
          
          // If a point is > 3.0 degrees (~330 km) away from BOTH previous and next adjacent station, it is a spike.
          // Discard it so that geocoding errors do not distort the route.
          if (dPrev > 3.0 && dNext > 3.0) {
            console.warn(`Filtering out geocoding outlier spike for station: ${pt.name}`);
            return false;
          }
          return true;
        });
      }

      // Find center coordinate
      let mapCenter = [73.7, 16.26]; // Kankavali default
      const currentGeocoded = filteredStations.find(
        (s) => s.name.toUpperCase() === (currentStation || "").toUpperCase()
      );
      if (currentGeocoded) {
        mapCenter = currentGeocoded.coords;
      } else if (filteredStations.length > 0) {
        mapCenter = filteredStations[0].coords;
      }

      // Initialize map
      mapInstance = tt.map({
        key: "RawLr6biXwCEZS2807iIDyGLaVkA9s9B",
        container: mapElement.current,
        center: mapCenter,
        zoom: 6
      });

      mapInstance.addControl(new tt.NavigationControl());

      mapInstance.on("load", () => {
        if (!isMounted || !mapInstance) return;

        const lineCoords = filteredStations.map((s) => s.coords);

        // 1. Draw route polyline
        if (lineCoords.length >= 2) {
          mapInstance.addSource("route", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: lineCoords
              }
            }
          });

          mapInstance.addLayer({
            id: "route",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round"
            },
            paint: {
              "line-color": "#ff6b00",
              "line-width": 6
            }
          });
        }

        // 2. Add custom markers
        filteredStations.forEach((station, index) => {
          const isCurrent = station.name.toUpperCase() === (currentStation || "").toUpperCase();
          const isNext = station.name.toUpperCase() === (nextStation || "").toUpperCase();
          const isDest = station.name.toUpperCase() === (destination || "").toUpperCase();
          const isSource = index === 0;

          const markerEl = document.createElement("div");

          if (isCurrent) {
            markerEl.className = "current-station-pulse-marker";
          } else if (isNext) {
            markerEl.className = "next-station-pulse-marker";
          } else if (isDest) {
            markerEl.className = "destination-station-marker";
          } else if (isSource) {
            markerEl.className = "source-station-marker";
          } else {
            markerEl.className = "intermediate-station-marker";
          }

          const label = isCurrent
            ? `📍 Current: ${station.name}`
            : isNext
            ? `➡ Next: ${station.name}`
            : isDest
            ? `🏁 Destination: ${station.name}`
            : isSource
            ? `🛫 Source: ${station.name}`
            : station.name;

          const popup = new tt.Popup({ offset: 12 }).setHTML(
            `<div style="color: #0f172a; font-family: sans-serif; font-size: 13px; font-weight: bold; padding: 4px 8px;">${label}</div>`
          );

          const marker = new tt.Marker({ element: markerEl })
            .setLngLat(station.coords)
            .setPopup(popup)
            .addTo(mapInstance);

          // Add hover popup support
          markerEl.addEventListener("mouseenter", () => popup.addTo(mapInstance));
          markerEl.addEventListener("mouseleave", () => popup.remove());
        });

        // 3. Zoom/Fit to route bounds
        if (lineCoords.length > 1) {
          const bounds = new tt.LngLatBounds();
          lineCoords.forEach((c) => bounds.extend(c));
          mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 12 });
        } else if (lineCoords.length === 1) {
          mapInstance.setCenter(lineCoords[0]);
          mapInstance.setZoom(10);
        }
      });
    };

    loadRouteAndInitMap();

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [currentStation, nextStation, destination, routeStations]);

  return (
    <>
      <style>{`
        @keyframes pulse-green {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8);
          }
          70% {
            transform: scale(1.15);
            box-shadow: 0 0 0 12px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        @keyframes pulse-orange {
          0% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.8);
          }
          70% {
            transform: scale(1.1);
            box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
          }
          100% {
            transform: scale(0.85);
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0);
          }
        }
        .current-station-pulse-marker {
          background-color: #10b981;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          cursor: pointer;
          animation: pulse-green 1.8s infinite;
          z-index: 10;
        }
        .next-station-pulse-marker {
          background-color: #f59e0b;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 3.5px solid white;
          cursor: pointer;
          animation: pulse-orange 1.8s infinite;
          z-index: 9;
        }
        .source-station-marker {
          background-color: #3b82f6;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2.5px solid white;
          cursor: pointer;
          z-index: 8;
        }
        .destination-station-marker {
          background-color: #ef4444;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2.5px solid white;
          cursor: pointer;
          z-index: 8;
        }
        .intermediate-station-marker {
          background-color: #6b7280;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1.5px solid white;
          cursor: pointer;
          z-index: 5;
        }
      `}</style>
      <div
        ref={mapElement}
        style={{
          height: "500px",
          width: "100%",
          borderRadius: "20px"
        }}
      />
    </>
  );
}