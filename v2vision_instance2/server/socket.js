const mysql = require("mysql2/promise");
const RBush = require("rbush").default;
const geolib = require("geolib");

// MySQL Connection Pool
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rahul@1992#",
  database: "v2vision_instance2",
  connectionLimit: 10,
});

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("✅ Vehicle connected:", socket.id);

    socket.on("add vehicle", async (data) => {
      try {
        const { vehicle_no, vehicle_type, coords, grid_level2 } = data;
        const { lat, lng, heading = 0, speed = 0 } = coords;

        await db.query(
          `INSERT INTO vehicles (id, vehicle_no, vehicle_type, lat, lng, heading, speed, grid_level2)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [socket.id, vehicle_no, vehicle_type, lat, lng, heading, speed, grid_level2]
        );

        console.log("🚗 Vehicle added:", vehicle_no);
      } catch (err) {
        console.error("❌ Error adding vehicle:", err);
      }
    });

    socket.on("update location", async (location) => {
      try {
        const { coords = {}, grid_level1, grid_level2 } = location;
        const { lat, lng, heading = 0, speed = 0 } = coords;

        await db.query(
          `UPDATE vehicles
           SET lat = ?, lng = ?, heading = ?, speed = ?, grid_level2 = ?, last_updated = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [lat, lng, heading, speed, grid_level2, socket.id]
        );

        const nearbyVehicles = await getNearbyVehicles(socket, lat, lng, grid_level1, grid_level2);
        //console.log(nearbyVehicles,"\n");
        socket.emit("nearby vehicles", nearbyVehicles);

      } catch (err) {
        console.error("❌ Error updating vehicle:", err);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await db.query(`DELETE FROM vehicles WHERE id = ?`, [socket.id]);
        console.log("🚫 Vehicle disconnected:", socket.id);
      } catch (err) {
        console.error("❌ Error deleting vehicle:", err);
      }
    });
  });
};

// 📍 Fetch nearby vehicles using grid and R-Tree
async function getNearbyVehicles(socket, lat, lng, grid_level1, grid_level2) {
  const intersectingGrids10 = getIntersectingGrid10(lat, lng);
  const groupByLevel1 = groupByGrid1000(intersectingGrids10);
     
  const grids10OfSameLevel = groupByLevel1[grid_level1] || [];
  const vehiclesOfSameGrid = await getGridVehicles(socket, grids10OfSameLevel);
 
  let gridVehicles = [...vehiclesOfSameGrid];
  
  const fetchPromises = Object.keys(groupByLevel1).map(async (key) => {
    if (key === grid_level1) return;

    const instance = getInstance(key);
    if (!instance) return;

    try {
      const res = await fetch(`http://${instance.host}:${instance.port}/get-vehicles-bygrid10`,{
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({grids: groupByLevel1[key]})
      }); 
                                         
      let data = await res.json();
      //console.log(`from ${key} : ${JSON.stringify(data)}`)                 
                        
      if (Array.isArray(data.vehicles)) gridVehicles.push(...data.vehicles);
      
    } catch(err) {
      console.log(`❌ Failed to fetch from grid ${key}`, err);
    }
  });

  await Promise.all(fetchPromises);

  return await getNearestVehicles(gridVehicles, lat, lng);
}

// 🔄 Get vehicles from DB based on grid list (excluding self)
async function getGridVehicles(socket, gridList) {
  if (!Array.isArray(gridList) || gridList.length === 0) return [];

  const placeholders = gridList.map(() => '?').join(',');
  const query = `
    SELECT id, vehicle_type, lat, lng, heading, speed 
    FROM vehicles 
    WHERE grid_level2 IN (${placeholders}) AND id != ?
  `;
  const values = [...gridList, socket.id];
  const [vehicles] = await db.query(query, values);

  return vehicles;
}

// 📌 Instance mapping logic (based on 1000km grid)
function getInstance(key) {
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

// 🎯 Group level-10 grids by level-1000 grids
function groupByGrid1000(grid10Indexes) {
  const result = {};

  for (const grid10 of grid10Indexes) {
    const [latIndex10, lngIndex10] = grid10.split("-").map(Number);
    const originLat = 37.0, originLng = 68.0, gridSizeKm = 10;

    const latCenter = originLat - (latIndex10 + 0.5) * (gridSizeKm / 111);
    const lngCenter = originLng + (lngIndex10 + 0.5) * (gridSizeKm / (111.32 * Math.cos(latCenter * Math.PI / 180)));

    const key = getGrid1000Index(latCenter, lngCenter);
    if (!result[key]) result[key] = [];
    result[key].push(grid10);
  }

  return result;
}

// 📐 Find intersecting 10km grids within radius
function getIntersectingGrid10(lat, lng, radius = 500000) {
  const originLat = 37.0, originLng = 68.0;
  const gridSizeKm = 10;
  const kmPerLat = 1 / 111;

  const latDeg = radius / 1000 * kmPerLat;
  const lngDeg = radius / 1000 * (1 / (111.32 * Math.cos(lat * Math.PI / 180)));

  const minLat = lat - latDeg, maxLat = lat + latDeg;
  const minLng = lng - lngDeg, maxLng = lng + lngDeg;

  const latStep = gridSizeKm * kmPerLat;
  const lngStep = gridSizeKm * (1 / (111.32 * Math.cos(lat * Math.PI / 180)));

  const startRow = Math.floor((originLat - maxLat) / latStep);
  const endRow = Math.floor((originLat - minLat) / latStep);
  const startCol = Math.floor((minLng - originLng) / lngStep);
  const endCol = Math.floor((maxLng - originLng) / lngStep);

  const grids = [];
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      grids.push(`${r}-${c}`);
    }
  }
  return grids;
}

// 🧠 Identify 1000km grid index for a coordinate
function getGrid1000Index(lat, lng) {
  const originLat = 37.0, originLng = 68.0;
  const gridSizeKm = 1000;

  const latDeg = gridSizeKm * (1 / 111);
  const lngDeg = gridSizeKm * (1 / (111.32 * Math.cos(lat * Math.PI / 180)));

  const latIndex = Math.floor((originLat - lat) / latDeg);
  const lngIndex = Math.floor((lng - originLng) / lngDeg);

  return `${latIndex}-${lngIndex}`;
}

// 📦 Get nearby vehicles from list within radius using R-tree
async function getNearestVehicles(vehicleList, lat, lng, radius = 500000) {
  const tree = new RBush();
  const items = vehicleList.map(v => ({
    minX: v.lng, maxX: v.lng,
    minY: v.lat, maxY: v.lat,
    ...v,
  }));
  tree.load(items);

  const bbox = getBoundingBox(lat, lng, radius);
  const candidates = tree.search(bbox);

  return candidates
    .filter(v => getDistance(lat, lng, v.lat, v.lng) <= radius)
    .map(v => ({
      id: v.id,
      vehicle_type: v.vehicle_type,
      coords: {
        lat: v.lat,
        lng: v.lng,
        heading: v.heading,
        speed: v.speed,
      },
    }));
}

// 📍 Bounding box around a point
function getBoundingBox(lat, lng, radiusMeters) {
  const R = 6371e3;
  const latRad = lat * Math.PI / 180;

  const dLat = radiusMeters / R;
  const dLng = radiusMeters / (R * Math.cos(latRad));

  return {
    minX: lng - dLng * (180 / Math.PI),
    maxX: lng + dLng * (180 / Math.PI),
    minY: lat - dLat * (180 / Math.PI),
    maxY: lat + dLat * (180 / Math.PI),
  };
}

// 📏 Haversine distance
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) *
            Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
