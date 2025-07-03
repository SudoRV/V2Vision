export function getDistanceXY(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const lat1Rad = toRadians(lat1);
    const lat2Rad = toRadians(lat2);
    const deltaLat = toRadians(lat2 - lat1);
    const yDistance = R * deltaLat;
    const deltaLng = toRadians(lng2 - lng1);
    const xDistance = R * deltaLng * Math.cos((lat1Rad + lat2Rad) / 2);
    return { x: xDistance, y: yDistance };
}

export function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function metersToPixels(dx, dy, lat, zoom) {
    const earthRadius = 6378137;
    const tileSize = 256;
    const metersPerPixel = (Math.cos(lat * Math.PI / 180) * 2 * Math.PI * earthRadius) / (tileSize * Math.pow(2, zoom));
    return { px_x: dx / metersPerPixel, px_y: dy / metersPerPixel };
}

export async function getLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                resolve(position);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    });
}


export function getBearing(lat1, lng1, lat2, lng2) {
    const toRadians = (deg) => (deg * Math.PI) / 180;
    const toDegrees = (rad) => (rad * 180) / Math.PI;

    const dLng = toRadians(lng2 - lng1);
    const y = Math.sin(dLng) * Math.cos(toRadians(lat2));
    const x =
        Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLng);

    const bearing = toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360 degrees
}



//get grid levels 

export function getGridLevels(lat, lng) {  
  const level1 = getGrid1000Index(lat, lng);
  const level2 = getGrid10Index(lat, lng);
  return { grid_level1: level1, grid_level2: level2 };
}


//dependencies function for grid calculation 
function getGrid10Index(lat, lng) {
  const originLat = 37.0; // Top of India
  const originLng = 68.0; // Left of India

  const latPerKm = 1 / 111; // 1 degree ≈ 111 km
  const lngPerKm = 1 / (111.32 * Math.cos(lat * Math.PI / 180)); // adjusts with latitude

  const gridSizeKm = 10;

  const latSizeDeg = gridSizeKm * latPerKm;
  const lngSizeDeg = gridSizeKm * lngPerKm;

  const latIndex = Math.floor((originLat - lat) / latSizeDeg); // inverted because N→S
  const lngIndex = Math.floor((lng - originLng) / lngSizeDeg); // W→E

  return `${latIndex}-${lngIndex}`; // grid10_id
}


export function getGrid1000Index(lat, lng) {
  const originLat = 37.0;
  const originLng = 68.0;

  const latPerKm = 1 / 111;
  const lngPerKm = 1 / (111.32 * Math.cos(lat * Math.PI / 180));

  const gridSizeKm = 1000;
  const latSizeDeg = gridSizeKm * latPerKm;
  const lngSizeDeg = gridSizeKm * lngPerKm;

  const latIndex = Math.floor((originLat - lat) / latSizeDeg); // N → S
  const lngIndex = Math.floor((lng - originLng) / lngSizeDeg); // W → E

  return `${latIndex}-${lngIndex}`;
}


// 📌 Instance mapping logic (based on 1000km grid)
export function getInstance(key) {
  const instances = {
    instance_1: { host: "localhost", port: 8000 },
    instance_2: { host: "localhost", port: 8001 },
    instance_3: { host: "localhost", port: 8002 },
    instance_4: { host: "localhost", port: 8003 },
  };

  if (["0-0", "0-1", "0-2", "0-3"].includes(key)) return instances.instance_1;
  if (["1-0", "1-1", "1-2", "1-3"].includes(key)) return instances.instance_2;
  if (["2-0", "2-1", "2-2", "2-3"].includes(key)) return instances.instance_3;
  if (["3-0", "3-1", "3-2", "3-3"].includes(key)) return instances.instance_4;
  return null;
}