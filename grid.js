function getGrid10Index(lat, lng) {
  const originLat = 37.0; // Top of India (north)
  const originLng = 68.0; // Left of India (west)

  const latPerKm = 1 / 111; // degrees per km latitude
  const lngPerKm = 1 / (111.32 * Math.cos(lat * Math.PI / 180)); // degrees per km longitude

  const gridSizeKm = 10;
  const latSizeDeg = gridSizeKm * latPerKm;
  const lngSizeDeg = gridSizeKm * lngPerKm;

  const latIndex = Math.floor((originLat - lat) / latSizeDeg); // N → S
  const lngIndex = Math.floor((lng - originLng) / lngSizeDeg); // W → E

  return `${latIndex}-${lngIndex}`;
}

function getGrid1000Index(lat, lng) {
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


const lat = 27.025;
const lng = 79.22;

//coords: { lat: 28.9683167, lng: 80.0177333 }


function getGridLevels(lat, lng) {  
  const level1 = getGrid1000Index(lat, lng);
  const level2 = getGrid10Index(lat, lng);
  return { grid_level1: level1, grid_level2: level2 };
}


console.log(getGridLevels(lat, lng));






function getIntersectingGrid10(lat, lng, radiusMeters = 3000) {
  const originLat = 37.0; // Top of India
  const originLng = 68.0; // Left of India

  const gridSizeKm = 10;
  const kmPerLat = 1 / 111;
  const latDegPerGrid = gridSizeKm * kmPerLat;
  const lngDegPerGrid = gridSizeKm * (1 / (111.32 * Math.cos(lat * Math.PI / 180)));

  const degLatRadius = radiusMeters / 1000 * kmPerLat;
  const degLngRadius = radiusMeters / 1000 * (1 / (111.32 * Math.cos(lat * Math.PI / 180)));

  const minLat = lat - degLatRadius;
  const maxLat = lat + degLatRadius;
  const minLng = lng - degLngRadius;
  const maxLng = lng + degLngRadius;

  const startRow = Math.floor((originLat - maxLat) / latDegPerGrid);
  const endRow = Math.floor((originLat - minLat) / latDegPerGrid);
  const startCol = Math.floor((minLng - originLng) / lngDegPerGrid);
  const endCol = Math.floor((maxLng - originLng) / lngDegPerGrid);

  const intersectingGrids = [];

  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      intersectingGrids.push(`${row}-${col}`);
    }
  }

  return intersectingGrids;
}



const intersectingGrid10 = getIntersectingGrid10(lat, lng);
console.log(intersectingGrid10);


console.log(groupByGrid1000(intersectingGrid10))


function groupByGrid1000(grid10Indexes) {
  const result = {};

  grid10Indexes.forEach((indexStr) => {
    const [latIndex10, lngIndex10] = indexStr.split("-").map(Number);

    // Each 1000km grid contains 100x100 10km grids
    const latIndex1000 = Math.floor(latIndex10 / 100);
    const lngIndex1000 = Math.floor(lngIndex10 / 100);

    const grid1000Key = `${latIndex1000}-${lngIndex1000}`;

    if (!result[grid1000Key]) {
      result[grid1000Key] = [];
    }

    result[grid1000Key].push(indexStr);
  });

  return result;
}
