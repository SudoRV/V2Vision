let lastRotation = 0;
let lastUpdate = Date.now();
let lastMode;

const headingHistory = [];
const maxHistory = 1;

export function updateHeading(event, headingMode, map, myMarker) {
  if (!map || event.alpha === null) return;

  // Calculate raw heading based on alpha and map orientation
  let rawHeading = 360 - (normalizeHeading(event.alpha) + (headingMode === "map-orient" ? 0 : map.getHeading()));
  
  // Flip heading if device is upside down
  if (Math.abs(event.beta) >= 90) {
    rawHeading -= 180;
  }

  // Add to history and maintain length
  headingHistory.push(rawHeading);
  if (headingHistory.length > maxHistory) headingHistory.shift();

  // Calculate average heading
  const heading = headingHistory.reduce((sum, h) => sum + h, 0) / headingHistory.length;
  const adjustedHeading = parseFloat((heading + 90).toFixed(3));

  requestAnimationFrame(() => {
    if (headingMode === "marker-orient" && myMarker) {
      myMarker.style.transform = `rotate(${adjustedHeading}deg)`;
    } else {
      if (Date.now() - lastUpdate > 30) {
        map.setHeading(adjustedHeading - 90);
        lastUpdate = Date.now();
      }
    }
  });

  lastMode = headingMode;

  lastRotation = adjustedHeading;  
  return adjustedHeading;
}



export function normalizeHeading(alpha) {
  const type = window.screen.orientation?.type || "portrait-primary";
  let correction = 0;  
  switch (type) {
    case "landscape-primary":
      correction = -90;
      break;
    case "landscape-secondary":
      correction = -270;
      break;
    case "portrait-secondary":
      correction = -180;
      break;
    case "portrait-primary":
      correction = 0;
    default:
      correction = 0;
      break;
  }

  return alpha + correction;
}




let lastHeading = 90;
export function updateMarkerDirection(map, marker, position, headingMode) {
  
  const heading = position.coords.heading;    
    
  if(headingMode == "marker-orient"){
    marker.style.transform = `rotate(${lastHeading + 90 }deg)`;
  }if(headingMode == "map-orient"){
    map.setHeading(lastHeading);
  }
   
  lastHeading = heading ? heading : lastHeading;
  return lastHeading;   
}
