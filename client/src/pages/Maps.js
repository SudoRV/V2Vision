import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Loader } from "@googlemaps/js-api-loader";

import {
  getLocation,
  getGrid1000Index,
  getGridLevels,
  getInstance,
} from "../functions/geoUtils";
import { updateHeading, updateMarkerDirection } from "../functions/uiUtils";

import PageLoader from "../components/Loader";
import otherCarsIcon from "../icons/ocar2.png";
import carIcon from "../icons/car.png";
import { Compass } from "lucide-react";
import GpsIcon from "../icons/GpsIcon";
import DirectionIcon from "../icons/DirectionIcon";
import RotateButton from "../icons/RotateButton";

import "../styles/Map.scss";

//function variables
const loader = new Loader({
  apiKey: "AIzaSyBloTfTFAIiB73YQo4L_PMr2JHuIY-B3aQ",
  version: "weekly",
});

const { Map, Circle } = await loader.importLibrary("maps");
const { LatLng } = await loader.importLibrary("core");
const { AdvancedMarkerElement } = await loader.importLibrary("marker");
//const { computeDistanceBetween } = await loader.importLibrary("geometry");
let emitingLocation = false;

// Variables
let map;
let myMarker;
let customCarIcon;
let myCircle;
let myPosition;
let myHeading;

let gheadingMode;
let isDragging = false;
let gdirectionEnabled;
let gpan;

const markers = new Set();

//socket initialisation
let socket;
let instance = {
  host: "",
  port: "",
};

const Maps = () => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [headingMode, setHeadingMode] = useState("marker-orient");
  gheadingMode = headingMode;

  const [pan, setPan] = useState(false);
  gpan = pan;

  const [directionEnabled, setDirectionEnabled] = useState(false);
  gdirectionEnabled = directionEnabled;
   
   
  //check for internet and location permission   

useEffect(() => {
  async function checkLocationPermission() {
    try {
      const status = await navigator.permissions.query({ name: "geolocation" });
            
      if (status.state === "granted") {
        console.log("✅ Location Permission Granted");
      } else if (status.state === "prompt") {
        console.log("ℹ️ Location Permission Prompt");
       navigator.geolocation.getCurrentPosition(()=>{
            console.log('initiated');
        });
        
      } else if (status.state === "denied") {
        console.warn("❌ Location Permission Denied");
      }

      status.onchange = () => {
        console.log("📍 Location permission changed:", status.state);
      };
    } catch (error) {
      console.error("❌ Permissions API not supported or failed:", error);
    }
  }

  checkLocationPermission();
}, []);
      
  // Function to initialize the map
  useEffect(() => {
    async function initMap() {
      try {
        let position;
        let last_zoom = localStorage.getItem("last_zoom");

        if (
          localStorage.getItem("last_center") &&
          localStorage.getItem("last_center") !== "undefined"
        ) {
          position = JSON.parse(localStorage.getItem("last_center"));
          myPosition = position;
        } else {
          position = await getLocation();
          localStorage.setItem("last_center", JSON.stringify(position));
        }

        if (!emitingLocation) {
          emitLocation();
          emitingLocation = true;
        }

        const center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        map = new Map(mapRef.current, {
          center: center,
          zoom: parseInt(last_zoom) || 12,
          heading: 0,
          mapTypeId: "hybrid",
          mapId: "2dba3db77f97d4db",

          zoomControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          disableDefaultUI: true,
        });

        window.onload = async () => {
          customCarIcon = document.getElementById("custom-marker");

          if (customCarIcon) {
            myMarker = new AdvancedMarkerElement({
              map,
              position: center,
              content: customCarIcon,
              zIndex: 1000,
            });
          } else {
            console.error("Custom icon element not found");
          }
        };

        myCircle = new Circle({
          center: center,
          radius: 300,
          strokeColor: "rgb(19, 192, 242)",
          strokeOpacity: 0,
          strokeWeight: 2,
          fillColor: "rgb(19, 192, 242)",
          fillOpacity: 0.4,
          map: map,
        });

        if (map) setMapLoaded(true);
      } catch (error) {
        console.error("Error loading Google Maps API:", error);
      }
    }

    initMap();
  }, []);

  useEffect(() => {
    if (!map) {
      console.log("map not loaded");
      return;
    }

    map.getDiv().style.height = `${window.innerHeight}px`;

    watchPosition(map, myMarker, myPosition);

    window.addEventListener("touchmove", () => {
      if (map?.getCenter().lat() !== myPosition?.coords.latitude) {
        setPan(false);
        isDragging = true;
        if (!gdirectionEnabled) {
          setHeadingMode("marker-orient");
        }
      }
    });

    if (!window.__deviceOrientationAttached) {
      window.addEventListener("deviceorientation", (event) => {
        if (customCarIcon) {
          if (!gdirectionEnabled) {
            myHeading = updateHeading(event, gheadingMode, map, customCarIcon);
          }
        }
      });
      window.__deviceOrientationAttached = true;
    }

    map.addListener("zoom_changed", () => {
      localStorage.setItem("last_zoom", map.getZoom());
    });
  }, [mapLoaded, pan]);

  useEffect(() => {
    if (myPosition && map) {
      document.getElementById("loader").style.display = "none";
    }
  }, [myPosition, mapLoaded]);

  return (
    <div id="map-container">
      <PageLoader />
       
      <div ref={mapRef} id="map"></div>

      <div id="custom-marker" className="custom-marker my-car">
        <img src={carIcon} />
      </div>

      {/* Controls */}
      <div id="controls" className="flex fdc aic">
        <button
          className="flex all-center"
          id="gps-btn"
          onClick={() => {
            if (!pan) {
              map.panTo(
                new LatLng(
                  myPosition.coords.latitude,
                  myPosition.coords.longitude
                )
              );

              isDragging = false;
              setPan(true);
            } else if (headingMode === "marker-orient") {
              if (map.getZoom() <= 15) {
                map.setZoom(16);
              } else {
                setTimeout(() => {
                  gdirectionEnabled ? map.setTilt(67.5) : map.setTilt(45);
                  customCarIcon.style.transform = `rotate(90deg)`;
                }, 100);
                setHeadingMode("map-orient");
              }
            } else if (headingMode === "map-orient") {
              setTimeout(() => {
                map.setHeading(0);
                map.setTilt(0);
              }, 100);
              setHeadingMode("marker-orient");
            }
          }}
        >
          {headingMode === "map-orient" ? (
            <Compass size={24} stroke="rgb(60,60,60)" strokeWidth={1.55} />
          ) : (
            <GpsIcon size={26} isEnabled={pan} />
          )}
        </button>

        <button
          className="flex all-center"
          onClick={() => {
            gpan = gdirectionEnabled;
            setDirectionEnabled(!directionEnabled);
            setTimeout(() => {
              customCarIcon.style.transform = `rotate(90deg)`;
              !directionEnabled ? map.setTilt(67.5) : map.setTilt(0);
            }, 100);
          }}
        >
          <DirectionIcon isEnabled={directionEnabled} size={28} />
        </button>

        <RotateButton
          onClick={(status) => {
            setTimeout(() => {
              map.panTo(
                new LatLng(
                  myPosition.coords.latitude,
                  myPosition.coords.longitude
                )
              );
              document.getElementById(
                "map"
              ).style.height = `${window.innerHeight}px`;
            }, 500);

            if (status === 0) {
              document.getElementsByClassName("navbar")[0].style.display =
                "none";
            } else if (status === 1) {
              document.getElementsByClassName("navbar")[0].style.display =
                "block";
            }
          }}
        />
      </div>
    </div>
  );
};

function watchPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        myPosition = position;
        handleSocket(myPosition);

        const { latitude, longitude } = position.coords;
        if (myMarker) {
          myMarker.position = { lat: latitude, lng: longitude };
          myCircle.setCenter({ lat: latitude, lng: longitude });

          if (gpan && !isDragging) {
            map.panTo({ lat: latitude, lng: longitude });
          }

          if (gdirectionEnabled) {
            myHeading = updateMarkerDirection(
              map,
              customCarIcon,
              myPosition,
              gheadingMode
            );
          }
        }
      },
      (error) => {
        console.log("Error getting location:" + error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );
  } else {
    alert("doesnt support location");
  }
}

let pendingSwitch = null;

function handleSocket(position) {
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;

  const currentGridKey = getGrid1000Index(lat, lng);
  const newInstance = getInstance(currentGridKey);

  // If same instance, no action needed
  if (
    newInstance.host === instance?.host &&
    newInstance.port === instance?.port
  ) {
    if (pendingSwitch) {
      clearTimeout(pendingSwitch);
      pendingSwitch = null;
    }
    return;
  }

  // Already scheduling a switch — avoid stacking timeouts
  if (pendingSwitch) return;

  // Schedule the switch with a delay
  pendingSwitch = setTimeout(() => {
    // Recalculate in case GPS jitter resolved back
    const checkGridKey = getGrid1000Index(
      position.coords.latitude,
      position.coords.longitude
    );
    const checkInstance = getInstance(checkGridKey);

    // If still different after 3 seconds, perform the switch
    if (
      checkInstance.host !== instance?.host ||
      checkInstance.port !== instance?.port
    ) {
      if (socket) socket.disconnect();

      socket = io(`http://${checkInstance.host}:${checkInstance.port}`);
      socket.on("connect", () => {
        console.log("✅ Switched to instance:", checkGridKey);
        handleNearbyVehiclesData(); // emit again
      });

      socket.on("nearby vehicles", (vehicles) => {
        markNearbyVehicles(vehicles);
      });

      instance = checkInstance;
    }

    pendingSwitch = null;
  }, 3000); // delay to tolerate jitter
}

//emit my location every second
function emitLocation() {
  const vehicleData = JSON.parse(localStorage.getItem("vehicleRegistrationData"));
          
  const vehicle_type = `${vehicleData?.vehicleType || "Two Wheeler"} | ${vehicleData?.fourWheelerType||"Bike"}` ; // only on first emit (client-side hardcoded or stored elsewhere)
  const vehicle_no = vehicleData?.vehicleNumber || "UK06AV4191"; // registration number - ideally user input
    

  let isFirstEmit = true;

  let notRegisteredInterval = Date.now();  
  setInterval(() => {    
   
    if(!vehicleData && Date.now() - notRegisteredInterval > 30000){
      //alert("Your Vehicle Not Registered Yet\nRedirecting to Registration Page!"); 
      //window.location.href = "/register-vehicle";
    }
  
    if (!myPosition || !socket?.id || !vehicleData) return;      

    const {
      latitude,
      longitude,
      heading = myHeading || 0,
      speed = 0,
    } = myPosition.coords;

    // 🧠 Calculate grids
    const { grid_level1, grid_level2 } = getGridLevels(latitude, longitude);

    const locationPayload = {
      vehicle_no: vehicle_no,
      vehicle_type: vehicle_type,
      coords: {
        lat: latitude,
        lng: longitude,
        heading,
        speed,
      },
      grid_level1,
      grid_level2,
    };

    let socketMessage = "update location";

    if (isFirstEmit) {
      // include vehicle_no and type on first emit
      locationPayload.vehicle_no = vehicle_no;
      locationPayload.vehicle_type = vehicle_type;
      isFirstEmit = false;
      socketMessage = "add vehicle";
    }

    socket.emit(socketMessage, locationPayload);
  }, 2000);
}

//get nearby vehicles is inside handle socket
function handleNearbyVehiclesData() {
  socket.on("nearby vehicles", (vehicles) => {
    console.log(vehicles);
    markNearbyVehicles(vehicles);
  });
}

function markNearbyVehicles(vehicles) {
  locateNewMarkers(vehicles);
  updateSameMarkers(vehicles);
  removeExpiredMarkers(vehicles);
}

function removeExpiredMarkers(vehicles) {
  const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));
  const expiredMarkers = [...markers].filter(
    (mark) => !vehicleIds.has(mark.id)
  );

  expiredMarkers.forEach((marker) => {
    marker.marker.setMap(null);
    markers.delete(marker);
  });
}

function updateSameMarkers(vehicles) {
  const vehicleIds = new Set(vehicles.map((vehicle) => vehicle.id));
  const existingMarkers = [...markers].filter((mark) =>
    vehicleIds.has(mark.id)
  );

  existingMarkers.forEach((marker) => {
    const car = vehicles.find((vehicle) => vehicle.id === marker.id);
    if (car) {
      const newPosition = new LatLng(car.coords.lat, car.coords.lng);
      marker.marker.position = newPosition;

      updateMarkerDirection(map, marker.icon, car, gheadingMode);
    }
  });
}

function locateNewMarkers(vehicles) {
  const markerIds = new Set([...markers].map((marker) => marker.id));
  const newVehicles = vehicles.filter((vehicle) => !markerIds.has(vehicle.id));

  newVehicles.forEach((vehicle) => {
    const location = {
      lat: vehicle.coords.lat,
      lng: vehicle.coords.lng,
    };

    const customIcon = document.createElement("div");
    customIcon.classList.add("custom-marker");
    customIcon.innerHTML = `<img src="${otherCarsIcon}" />`;

    const VMarker = new AdvancedMarkerElement({
      map: map,
      position: location,
      content: customIcon,
    });

    updateMarkerDirection(map, customIcon, vehicle, gheadingMode);

    markers.add({
      id: vehicle.id,
      marker: VMarker,
      icon: customIcon,
      location: vehicle,
    });
  });
}

export default Maps;
